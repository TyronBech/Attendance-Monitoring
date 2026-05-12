import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import Footer from '@/components/footer';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader />
            <AppContent variant="header">{children}</AppContent>
            <Footer />
        </AppShell>
    );
}
