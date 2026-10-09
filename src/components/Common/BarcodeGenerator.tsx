import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'QR';

interface BarcodeGeneratorProps {
  value: string;
  format?: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  noBorder?: boolean;
  className?: string;
}

export const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  format = 'CODE128',
  width = 1.5,
  height = 40,
  displayValue = true,
  fontSize = 11,
  margin = 2,
  noBorder = false,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!value) return;

    if (format === 'QR') {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          value,
          {
            width: height ? Math.max(48, height + 10) : 64,
            margin: margin,
            color: {
              dark: '#000000',
              light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
          },
          (err) => {
            if (err) console.warn('QR Code rendering error:', err);
          }
        );
      }
    } else {
      if (svgRef.current) {
        try {
          // If format is EAN13 or UPC, ensure appropriate value or fallback safely
          let renderFormat: any = format;
          let renderValue = value.trim();

          if (format === 'EAN13' && renderValue.length !== 13) {
            renderFormat = 'CODE128'; // graceful fallback so it doesn't throw
          } else if (format === 'UPC' && renderValue.length !== 12) {
            renderFormat = 'CODE128';
          }

          JsBarcode(svgRef.current, renderValue, {
            format: renderFormat,
            width: width,
            height: height,
            displayValue: displayValue,
            fontSize: fontSize,
            font: 'monospace',
            textMargin: 1,
            margin: margin,
            background: '#ffffff',
            lineColor: '#000000',
            valid: () => {}
          });
        } catch (err) {
          console.warn('JsBarcode rendering error:', err);
        }
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  if (!value) return null;

  return (
    <div className={`flex flex-col items-center justify-center bg-white ${noBorder ? '' : 'p-1 rounded border border-slate-200'} ${className}`}>
      {format === 'QR' ? (
        <canvas ref={canvasRef} className="max-w-full" />
      ) : (
        <svg ref={svgRef} className="max-w-full overflow-hidden block"></svg>
      )}
    </div>
  );
};
