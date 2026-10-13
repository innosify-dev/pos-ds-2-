/**
 * Product barcode lookup used by billing and label printing.
 * Camera scanning is not implemented. Keyboard-wedge scanners type into the billing field.
 */

export {
  assignMissingBarcodes,
  findProductByScan,
  nextInternalBarcode,
  productScanCode,
  qrPayload,
  scanLookupValue,
} from './codes.js';

import { findProductByScan } from './codes.js';

export const barcodeService = {
  lookup: findProductByScan,
};
