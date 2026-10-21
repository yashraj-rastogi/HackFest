import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item } from '../db/schema';
import { getItemByBarcode, linkBarcode } from '../db/repos';
import { recordSale } from '../db/ledger';
import { startScan } from '../services/scanner';
import { useTranslation } from '../i18n';
import { triggerHaptic, triggerSuccessHaptic } from '../lib/haptics';
import { formatQty } from '../domain/units';
import {
  X,
  ScanBarcode as ScanIcon,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';

export const ScanBarcode: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'sale'; // 'sale' | 'stock'
  const { lang } = useTranslation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);

  // Unknown barcode state
  const [unknownCode, setUnknownCode] = useState<string | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [recentScannedItem, setRecentScannedItem] = useState<{
    item: Item;
    action: 'sale' | 'stock';
    qtyFormatted: string;
  } | null>(null);

  const inventory = useLiveQuery(() => db.items.filter((i) => !i.archived).toArray()) || [];

  // Filter inventory for linking unknown codes
  const filteredInventory = inventory.filter((item) => {
    if (!linkSearchQuery.trim()) return true;
    const q = linkSearchQuery.toLowerCase();
    const hi = item.names.hi?.toLowerCase() || '';
    const en = item.names.en?.toLowerCase() || '';
    const hinglish = item.names.hinglish?.toLowerCase() || '';
    return hi.includes(q) || en.includes(q) || hinglish.includes(q);
  });

  const handleBarcodeDetected = async (code: string) => {
    if (!scanning || unknownCode || recentScannedItem) return;

    triggerHaptic(20);

    // Look up barcode in Dexie
    const item = await getItemByBarcode(code);

    if (item) {
      // Known barcode!
      triggerSuccessHaptic();
      setScanning(false);

      if (mode === 'sale') {
        const saleQty = item.defaultSaleQty;
        await recordSale(item.id, saleQty, 'scan');
        const formatted = formatQty(saleQty, item.baseUnit, lang);

        setRecentScannedItem({
          item,
          action: 'sale',
          qtyFormatted: formatted,
        });

        // Auto close after 1.6s feedback
        setTimeout(() => {
          navigate('/sale');
        }, 1600);
      } else {
        // Stock mode -> Open stock manage for this item
        setRecentScannedItem({
          item,
          action: 'stock',
          qtyFormatted: '',
        });

        setTimeout(() => {
          navigate(`/stock/${item.id}`);
        }, 800);
      }
    } else {
      // Unknown barcode -> Prompt to link or create
      triggerHaptic(40);
      setScanning(false);
      setUnknownCode(code);
    }
  };

  // Start scanner lifecycle
  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    const cleanup = startScan(
      videoRef.current,
      (code) => handleBarcodeDetected(code),
      (err) => {
        setScanError(err.message || 'Camera permission denied or camera not found');
      }
    );

    return () => {
      cleanup();
    };
  }, [scanning]);

  // Link unknown code to an existing item
  const handleLinkToItem = async (item: Item) => {
    if (!unknownCode) return;
    triggerSuccessHaptic();

    await linkBarcode(unknownCode, item.id);

    if (mode === 'sale') {
      const saleQty = item.defaultSaleQty;
      await recordSale(item.id, saleQty, 'scan');
      navigate('/sale');
    } else {
      navigate(`/stock/${item.id}`);
    }
  };

  // Create new product with this barcode pre-filled
  const handleCreateNewWithBarcode = () => {
    if (!unknownCode) return;
    navigate(`/stock/new?barcode=${encodeURIComponent(unknownCode)}`);
  };

  const handleClose = () => {
    triggerHaptic(10);
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
      {/* Top Overlay Bar */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <ScanIcon className="w-5 h-5 text-brand" />
          <span className="font-bold text-sm tracking-wide">
            {mode === 'sale' ? 'Becha Barcode Scan' : 'Stock Barcode Scan'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close scanner"
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Video Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Viewfinder Target Box */}
        {scanning && (
          <div className="relative z-10 w-64 h-64 border-2 border-white/60 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand rounded-br-xl" />

            {/* Red Laser Scanning line */}
            <div className="w-full h-0.5 bg-brand animate-bounce opacity-90 shadow-lg" />
          </div>
        )}

        {/* Camera Permission / Error Overlay */}
        {scanError && (
          <div className="relative z-20 max-w-xs p-6 rounded-3xl bg-surface text-center space-y-3 mx-4 border border-line shadow-xl">
            <AlertCircle className="w-10 h-10 text-danger mx-auto" />
            <h3 className="text-base font-bold text-ink">Camera Not Available</h3>
            <p className="text-xs text-ink-muted">{scanError}</p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-brand text-white font-bold text-sm"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Success Confirmation Card */}
        {recentScannedItem && (
          <div className="relative z-20 p-5 rounded-3xl bg-surface border border-brand/40 text-center space-y-2 shadow-2xl animate-in zoom-in-95 mx-4 max-w-xs">
            <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mx-auto text-brand">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="text-2xl">{recentScannedItem.item.emoji}</div>
            <h3 className="text-lg font-bold text-ink">
              {recentScannedItem.item.names[lang] || recentScannedItem.item.names.hi || recentScannedItem.item.names.en}
            </h3>
            {recentScannedItem.action === 'sale' ? (
              <p className="text-sm font-semibold text-brand-dark">
                Sold −{recentScannedItem.qtyFormatted} recorded!
              </p>
            ) : (
              <p className="text-sm font-semibold text-brand-dark">Opening Stock Details...</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Hint or Unknown Code Bottom Sheet */}
      <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white">
        {scanning && (
          <p className="text-center text-xs text-white/80 pb-3">
            Point camera at any product barcode. Works 100% offline.
          </p>
        )}

        {/* Unknown Code Resolver Sheet */}
        {unknownCode && (
          <div className="bg-surface text-ink rounded-3xl p-5 border border-line space-y-4 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  Naya Barcode Mila
                </span>
                <h3 className="text-base font-bold text-ink">
                  Code: {unknownCode}
                </h3>
                <p className="text-xs text-ink-muted">
                  Choose which product this barcode belongs to.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUnknownCode(null);
                  setScanning(true);
                }}
                className="w-8 h-8 rounded-full bg-canvas border border-line flex items-center justify-center text-ink-muted active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option A: Search existing inventory to link */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                <input
                  type="text"
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  placeholder="Kisi purane samaan se jodein..."
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-canvas border border-line text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-line/40">
                {filteredInventory.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLinkToItem(item)}
                    className="w-full p-2 text-left flex items-center justify-between hover:bg-canvas rounded-xl active:bg-brand-soft/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-xs font-bold text-ink truncate">
                        {item.names[lang] || item.names.hi || item.names.en}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-brand flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      <span>Jodo</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Option B: Create new item */}
            <div className="pt-2 border-t border-line">
              <button
                type="button"
                onClick={handleCreateNewWithBarcode}
                className="w-full min-h-[46px] px-4 rounded-xl bg-brand text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Naya Samaan Banao (Create New Item)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
