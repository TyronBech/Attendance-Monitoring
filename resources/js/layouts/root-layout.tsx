import React from 'react';
import { DynamicTheme } from '@/components/dynamic-theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DynamicTheme />
            {children}
        </>
    );
}
