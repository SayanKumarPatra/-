/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBannerSlider } from './components/HeroBannerSlider';
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
import { PackagePricingSection } from './components/PackagePricingSection';
import {
  CORE_SUBJECT_IDS,
  LANGUAGE_SUBJECT_IDS,
  SPECIALIZATION_SUBJECT_IDS,
  calculatePackagePrice,
} from './constants/packageConfig';
import { api } from './services/api';
import { FALLBACK_PRODUCTS } from './constants/fallbackProducts';
import { subscribeToProductsRealtime } from './firebase/firebase';
import type { Product, AppView } from './types';

function AppContent() {
  const { student } = useAuth();

  // Navigation View - Dedicated Full Page Architecture
  const [currentView, setCurrentView] = useState<AppView>('catalog');

  // Catalog State - Initialized with default 11 BCA 3rd Sem products to eliminate loading spinners or retry errors
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'specialization'>('all');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState('');

  // Cart & Selection State - Compulsory Core 4 subjects included by default
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([...CORE_SUBJECT_IDS]);

  // Purchased IDs set for current logged in student
  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>([]);

  // Modals & Viewer State
  const [activeViewerProductId, setActiveViewerProductId] = useState<string | null>(null);
  const [deviceMismatchData, setDeviceMismatchData] = useState<{
    registeredDevice: any;
    supportInfo: any;
  } | null>(null);
  const [authDefaultRegister, setAuthDefaultRegister] = useState(false);

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
          const activeIds = data.purchases
            .filter((p: any) => p.accessStatus === 'active')
            .map((p: any) => p.productId);
          const allPurchasedIds = data.purchases.map((p: any) => p.productId);

          setPurchasedProductIds(activeIds);
          // Remove already-purchased/pending products from cart
          setSelectedProductIds((prev) => prev.filter((id) => !allPurchasedIds.includes(id)));
        })
        .catch((err) => {
          console.error('Error fetching student purchases:', err);
        });
    } else {
      setPurchasedProductIds([]);
    }
  }, [student?.id]);

  // Handle optional Language selection (Max 1 or null)
  const handleSelectLanguage = (langId: string | null) => {
    setSelectedProductIds((prev) => {
      const withoutLang = prev.filter((id) => !(LANGUAGE_SUBJECT_IDS as readonly string[]).includes(id));
      const nextSet = new Set([...withoutLang, ...CORE_SUBJECT_IDS]);
      if (langId) {
        nextSet.add(langId);
      }
      return Array.from(nextSet);
    });
  };

  // Handle optional Specialization selection (Max 1 or null)
  const handleSelectSpecialization = (specId: string | null) => {
    setSelectedProductIds((prev) => {
      const withoutSpec = prev.filter((id) => !(SPECIALIZATION_SUBJECT_IDS as readonly string[]).includes(id));
      const nextSet = new Set([...withoutSpec, ...CORE_SUBJECT_IDS]);
      if (specId) {
        nextSet.add(specId);
      }
      return Array.from(nextSet);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    // Core subjects are compulsory and cannot be removed
    if ((CORE_SUBJECT_IDS as readonly string[]).includes(productId as any)) return;
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  const packagePricing = useMemo(() => {
    return calculatePackagePrice(selectedProductIds);
  }, [selectedProductIds]);

  const totalPrice = packagePricing.launchOfferPrice;

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
        onOpenCart={() => setCurrentView('checkout')}
        onOpenAuth={(isRegister = false) => {
          setAuthDefaultRegister(isRegister);
          setCurrentView('auth');
        }}
        onOpenAbout={() => setCurrentView('about')}
        onOpenContact={() => setCurrentView('contact')}
      />

      {/* Main View Switcher - Full Page Rendering */}
      <main className="flex-1">
        {currentView === 'auth' ? (
          <AuthModal
            isOpen={true}
            isPage={true}
            onClose={() => setCurrentView('catalog')}
            defaultIsRegister={authDefaultRegister}
            onSuccess={() => {
              setCurrentView('purchased');
            }}
          />
        ) : currentView === 'checkout' ? (
          <CheckoutModal
            isOpen={true}
            isPage={true}
            onClose={() => setCurrentView('catalog')}
            selectedProducts={selectedProducts}
            onRemoveProduct={handleRemoveFromCart}
            onPurchaseSuccess={(orderId) => {
              const activeStudent = student || JSON.parse(localStorage.getItem('bca_logged_in_student') || 'null');
              if (activeStudent?.id || activeStudent?.email || activeStudent?.mobile) {
                const queryId = activeStudent.id || activeStudent.email || activeStudent.mobile;
                api.getStudentPurchases(queryId).then((data) => {
                  setPurchasedProductIds(
                    data.purchases.filter((p: any) => p.accessStatus === 'active').map((p: any) => p.productId)
                  );
                }).catch(() => {});
              }
              setSelectedProductIds([]);
              setCurrentView('purchased');
            }}
          />
        ) : currentView === 'about' ? (
          <AboutModal
            isOpen={true}
            isPage={true}
            onClose={() => setCurrentView('catalog')}
          />
        ) : currentView === 'contact' ? (
          <ContactModal
            isOpen={true}
            isPage={true}
            onClose={() => setCurrentView('catalog')}
          />
        ) : currentView === 'purchased' ? (
          <PurchasedContent
            onOpenViewer={(prodId) => setActiveViewerProductId(prodId)}
            onGoToCatalog={() => setCurrentView('catalog')}
            onOpenAuth={() => {
              setAuthDefaultRegister(false);
              setCurrentView('auth');
            }}
          />
        ) : (
          /* Public Storefront Layout Clean & Streamlined */
          <>
            {/* 2. Sliding Banner Carousel directly beneath the Navbar */}
            {/* 2. Sliding Banner Carousel directly beneath the Navbar */}
            <div className="pt-2 px-2 sm:px-4">
              <HeroBannerSlider
                onExploreClick={() => {
                  document.getElementById('packages-pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>

            {/* 3. BCA STUDY POINT – Package Selection & Pricing Section (Compulsory Core, Optional Language, Optional Specialization, Live Order Summary) */}
            <PackagePricingSection
              products={products}
              selectedProductIds={selectedProductIds}
              purchasedProductIds={purchasedProductIds}
              onSelectLanguage={handleSelectLanguage}
              onSelectSpecialization={handleSelectSpecialization}
              onProceedToCheckout={() => setCurrentView('checkout')}
              onOpenViewer={(prodId) => setActiveViewerProductId(prodId)}
            />

            {/* 4. How It Works: Simple 1, 2, 3, 4 numbered points */}
            <HowItWorks />
          </>
        )}
      </main>


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

      {/* 7. Native Mobile App Style Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCount={selectedProductIds.length}
        onOpenCart={() => setCurrentView('checkout')}
        onOpenAuth={() => {
          setAuthDefaultRegister(false);
          setCurrentView('auth');
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
