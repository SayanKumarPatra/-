/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SemesterSelector } from './components/SemesterSelector';
import { SubjectCatalog } from './components/SubjectCatalog';
import { HowItWorks } from './components/HowItWorks';
import { SecurityBenefits } from './components/SecurityBenefits';
import { CheckoutModal } from './components/CheckoutModal';
import { PurchasedContent } from './components/PurchasedContent';
import { SecurePdfViewer } from './components/SecurePdfViewer';
import { DeviceLockedModal } from './components/DeviceLockedModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { api } from './services/api';
import type { Semester, Product } from './types';

function AppContent() {
  const { student } = useAuth();

  // Navigation View
  const [currentView, setCurrentView] = useState<'catalog' | 'purchased' | 'admin'>('catalog');

  // Catalog State
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string | 'all'>('sem-1');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  // Cart & Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Purchased IDs set for current logged in student
  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>([]);

  // Modals & Viewer State
  const [activeViewerProductId, setActiveViewerProductId] = useState<string | null>(null);
  const [deviceMismatchData, setDeviceMismatchData] = useState<{
    registeredDevice: any;
    supportInfo: any;
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRegister, setAuthDefaultRegister] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Load catalog on mount
  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    setCatalogError('');
    try {
      const [semRes, prodRes] = await Promise.all([
        api.getSemesters(),
        api.getProducts(),
      ]);
      setSemesters(semRes.semesters);
      setProducts(prodRes.products);
      if (semRes.semesters.length > 0 && activeSemesterId === 'sem-1') {
        const hasSem1 = semRes.semesters.some((s) => s.id === 'sem-1');
        if (!hasSem1) setActiveSemesterId(semRes.semesters[0].id);
      }
    } catch (err: any) {
      console.error('Error loading storefront catalog:', err);
      setCatalogError(err.message || 'Failed to load question banks');
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Sync student purchases when logged in
  useEffect(() => {
    if (student?.id) {
      api
        .getStudentPurchases(student.id)
        .then((data) => {
          const ids = data.purchases.map((p) => p.productId);
          setPurchasedProductIds(ids);
          // Remove already-purchased products from cart
          setSelectedProductIds((prev) => prev.filter((id) => !ids.includes(id)));
        })
        .catch((err) => {
          console.error('Error fetching student purchases:', err);
        });
    } else {
      setPurchasedProductIds([]);
    }
  }, [student?.id]);

  // Handle subject selection toggle
  const handleToggleSelect = (productId: string) => {
    if (purchasedProductIds.includes(productId)) {
      setActiveViewerProductId(productId);
      return;
    }

    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (activeSemesterId !== 'all' && prod.semesterId !== activeSemesterId) {
        return false;
      }
      return true;
    });
  }, [products, activeSemesterId]);

  const activeSemester = useMemo(() => {
    return semesters.find((s) => s.id === activeSemesterId);
  }, [semesters, activeSemesterId]);

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  const totalPrice = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  }, [selectedProducts]);

  const getSubjectCountForSemester = (semId: string) => {
    return products.filter((p) => p.semesterId === semId).length;
  };

  // If Admin portal is open, render AdminPanel
  if (currentView === 'admin') {
    return <AdminPanel onExit={() => setCurrentView('catalog')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-radial-[at_50%_0%] from-[#970014] via-[#65000D] to-[#240005] text-white selection:bg-[#FFD34E] selection:text-[#3D0009]">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCount={selectedProductIds.length}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenAuth={(isRegister = false) => {
          setAuthDefaultRegister(isRegister);
          setIsAuthModalOpen(true);
        }}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'purchased' ? (
          <PurchasedContent
            onOpenViewer={(prodId) => setActiveViewerProductId(prodId)}
            onGoToCatalog={() => setCurrentView('catalog')}
            onOpenAuth={() => {
              setAuthDefaultRegister(false);
              setIsAuthModalOpen(true);
            }}
          />
        ) : (
          /* Public Storefront matching Burgundy Liquid Glass Reference */
          <>
            {/* 1. Hero Section */}
            <Hero
              onExploreClick={() => {
                document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Browse by Semester Selector */}
            <SemesterSelector
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              onSelectSemester={setActiveSemesterId}
              getSubjectCountForSemester={getSubjectCountForSemester}
            />

            {/* 3. Master Liquid Glass Subject Catalog Container */}
            <SubjectCatalog
              products={filteredProducts}
              activeSemester={activeSemester}
              selectedProductIds={selectedProductIds}
              purchasedProductIds={purchasedProductIds}
              totalPrice={totalPrice}
              isLoading={isLoadingCatalog}
              error={catalogError}
              onRetry={loadCatalog}
              onToggleSelect={handleToggleSelect}
              onOpenViewer={(prodId) => setActiveViewerProductId(prodId)}
              onProceedToCheckout={() => setIsCheckoutOpen(true)}
            />

            {/* 4. How It Works Section */}
            <HowItWorks />

            {/* 5. Security Benefits Section */}
            <SecurityBenefits />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedProducts={selectedProducts}
        onRemoveProduct={handleRemoveFromCart}
        onPurchaseSuccess={() => {
          if (student?.id) {
            api.getStudentPurchases(student.id).then((data) => {
              setPurchasedProductIds(data.purchases.map((p) => p.productId));
            });
          }
          setSelectedProductIds([]);
          setCurrentView('purchased');
        }}
      />

      {/* Secure PDF Viewer */}
      {activeViewerProductId && (
        <SecurePdfViewer
          productId={activeViewerProductId}
          onClose={() => setActiveViewerProductId(null)}
          onDeviceMismatch={(registeredDevice, supportInfo) => {
            setDeviceMismatchData({ registeredDevice, supportInfo });
          }}
        />
      )}

      {/* Device Locked Modal */}
      <DeviceLockedModal
        isOpen={Boolean(deviceMismatchData)}
        onClose={() => setDeviceMismatchData(null)}
        registeredDevice={deviceMismatchData?.registeredDevice}
        supportInfo={deviceMismatchData?.supportInfo}
      />

      {/* Student Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultIsRegister={authDefaultRegister}
        onSuccess={() => {
          setCurrentView('purchased');
        }}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
