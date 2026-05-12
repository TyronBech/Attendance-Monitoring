<?php

namespace App\Helpers;

class ColorHelper
{
  public static function generatePalette(string $hex): array
  {
    [$r, $g, $b] = self::parseHex($hex);
    [$h, $s, $l0] = self::rgbToHsl($r, $g, $b);

    $scale = [
      50  =>  0.95,
      100 =>  0.85,
      200 =>  0.70,
      300 =>  0.50,
      400 =>  0.25,
      500 =>  0.00,
      600 => -0.15,
      700 => -0.30,
      800 => -0.50,
      900 => -0.70,
    ];

    $palette = [];

    foreach ($scale as $key => $delta) {
      $l = $delta > 0
        ? $l0 + (1 - $l0) * $delta
        : $l0 * (1 + $delta);

      // clamp
      $l = max(0, min(1, $l));

      // Slight desaturation for extremes (Tailwind behavior)
      $sAdj = $s * ($key <= 100 ? 0.80 : ($key >= 800 ? 0.90 : 1.0));

      [$rr, $gg, $bb] = self::hslToRgb($h, $sAdj, $l);
      $palette[$key] = "$rr $gg $bb";
    }

    return $palette;
  }

  /* ---------------- HSL CORE ---------------- */

  private static function rgbToHsl($r, $g, $b): array
  {
    $r /= 255;
    $g /= 255;
    $b /= 255;
    $max = max($r, $g, $b);
    $min = min($r, $g, $b);
    $l = ($max + $min) / 2;

    if ($max === $min) {
      return [0, 0, $l];
    }

    $d = $max - $min;
    $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);

    if ($max === $r) {
      $h = ($g - $b) / $d + ($g < $b ? 6 : 0);
    } elseif ($max === $g) {
      $h = ($b - $r) / $d + 2;
    } else {
      $h = ($r - $g) / $d + 4;
    }

    return [$h / 6, $s, $l];
  }

  private static function hslToRgb($h, $s, $l): array
  {
    if ($s == 0) {
      $v = round($l * 255);
      return [$v, $v, $v];
    }

    $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
    $p = 2 * $l - $q;

    return [
      round(self::hueToRgb($p, $q, $h + 1 / 3) * 255),
      round(self::hueToRgb($p, $q, $h) * 255),
      round(self::hueToRgb($p, $q, $h - 1 / 3) * 255),
    ];
  }

  private static function hueToRgb($p, $q, $t)
  {
    if ($t < 0) $t += 1;
    if ($t > 1) $t -= 1;
    if ($t < 1 / 6) return $p + ($q - $p) * 6 * $t;
    if ($t < 1 / 2) return $q;
    if ($t < 2 / 3) return $p + ($q - $p) * (2 / 3 - $t) * 6;
    return $p;
  }

  private static function parseHex(string $hex): array
  {
    $hex = ltrim($hex, '#');
    if (strlen($hex) === 3) {
      $hex = "{$hex[0]}{$hex[0]}{$hex[1]}{$hex[1]}{$hex[2]}{$hex[2]}";
    }

    return [
      hexdec(substr($hex, 0, 2)),
      hexdec(substr($hex, 2, 2)),
      hexdec(substr($hex, 4, 2)),
    ];
  }
}
