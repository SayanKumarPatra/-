/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBannerSlider } from './components/HeroBannerSlider';
import { SemesterSelector } from './components/SemesterSelector';
import { SubjectCatalog } from './components/SubjectCatalog';
import { HowItWorks } from './components/HowItWorks';
import { CheckoutModal } from './components/CheckoutModal';
import { PurchasedContent } from './components/PurchasedContent';
import { SecurePdfViewer } from './components/SecurePdfViewer';
import { DeviceLockedModal } from './components/DeviceLockedModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';
import { ContactModal } from './components/ContactModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { FALLBACK_PRODUCTS } from './constants/fallbackProducts';
import { subscribeToProductsRealtime } from './firebase/firebase';
import type { Product } from './types';

function AppContent() {
  const { student } = useAuth();

  // Navigation View
  const [currentView, setCurrentView] = useState<'catalog' | 'purchased' | 'admin'>('catalog');

  // Catalog State - Initialized with default 11 BCA 3rd Sem products to eliminate loading spinners or retry errors
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'specialization'>('all');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
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

  const loadCatalog = () => {
    setIsLoadingCatalog(true);
    setCatalogError('');
    api.getProducts()
      .then((res) => {
        if (res?.products?.length > 0) {
          setProducts(res.products);
        }
      })
      .catch((err) => {
        console.warn('API products fallback:', err);
        setCatalogError('Failed to load products. Please try again.');
      })
      .finally(() => {
        setIsLoadingCatalog(false);
      });
  };

  // Load catalog & real-time Firebase Firestore listener
  useEffect(() => {
    loadCatalog();

    // Real-time Firestore subscription: instantly updates whenever admin edits price or image
    const unsubscribe = subscribeToProductsRealtime((realtimeProducts) => {
      if (realtimeProducts && realtimeProducts.length > 0) {
        setProducts(realtimeProducts);
        setIsLoadingCatalog(false);
      }
    });

    return () => {
      unsubscribe();
    };
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
  const coreCount = useMemo(() => products.filter((p) => p.paperType === 'core').length, [products]);
  const specializationCount = useMemo(() => products.filter((p) => p.paperType === 'specialization').length, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'core') {
      return products.filter((prod) => prod.paperType === 'core');
    }
    if (activeCategory === 'specialization') {
      return products.filter((prod) => prod.paperType === 'specialization');
    }
    return products;
  }, [products, activeCategory]);

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  const totalPrice = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  }, [selectedProducts]);

  // If Admin portal is open, render AdminPanel
  if (currentView === 'admin') {
    return <AdminPanel onExit={() => setCurrentView('catalog')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-radial-[at_50%_0%] from-[#970014] via-[#65000D] to-[#240005] text-white selection:bg-[#FFD34E] selection:text-[#3D0009] pb-14 md:pb-0">
      {/* 1. Header: Logo & Name on Left, Login/Register on Right (Zero overflow on mobile) */}
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
          /* Public Storefront Layout Clean & Streamlined */
          <>
            {/* 2. Sliding Banner Carousel directly beneath the Navbar (No duplicate hero logos) */}
            <div className="pt-2 px-2 sm:px-4">
              <HeroBannerSlider
                onExploreClick={() => {
                  document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>

            {/* 3. Category Filter: All Subjects, Core Papers, Specialization Pack */}
            <SemesterSelector
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              coreCount={coreCount}
              specializationCount={specializationCount}
              totalCount={products.length}
            />

            {/* 4. Subject Cards Catalog (3 columns on mobile, textbook cover images, minimal text) */}
            <SubjectCatalog
              products={filteredProducts}
              activeCategory={activeCategory}
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

            {/* 5. How It Works: Simple 1, 2, 3, 4 numbered points (no cards, no bloat) */}
            <HowItWorks />
          </>
        )}
      </main>

      {/* 6. Compact Footer */}
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

      {/* Fast, Clean Online PDF Viewer for Purchased Content */}
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

      {/* 7. Native Mobile App Style Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCount={selectedProductIds.length}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenAuth={() => {
          setAuthDefaultRegister(false);
          setIsAuthModalOpen(true);
        }}
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
