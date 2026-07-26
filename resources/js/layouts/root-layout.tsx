import { DynamicTheme } from '@/components/dynamic-theme';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DynamicTheme />
            {children}
        </>
    );
}
