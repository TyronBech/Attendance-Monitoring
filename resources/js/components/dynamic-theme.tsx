import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { ColorHelper } from '@/lib/color-helper';

export function DynamicTheme() {
  const { ui } = usePage().props as any;

  useEffect(() => {
    if (!ui?.theme_colors) {
        return;
    }

    const colors = {
      primary: ui.theme_colors.primary || '#20246c',
      secondary: ui.theme_colors.secondary || '#EBF5FF',
      tertiary: ui.theme_colors.tertiary || '#C27803',
    };

    const root = document.documentElement;

    Object.entries(colors).forEach(([name, hex]) => {
      root.style.setProperty(`--color-${name}`, hex);
      const palette = ColorHelper.generatePalette(hex);
      Object.entries(palette).forEach(([shade, rgbValue]) => {
        root.style.setProperty(`--color-${name}-${shade}`, rgbValue);
      });
    });

    // Set some global defaults if needed
    root.style.setProperty('--loader-dot-default', colors.tertiary);
  }, [ui]);

  return (
    <Head>
      {ui?.org_logo_base64 && (
        <link rel="icon" type="image/x-icon" href={ui.org_logo_base64} />
      )}
    </Head>
  );
}
