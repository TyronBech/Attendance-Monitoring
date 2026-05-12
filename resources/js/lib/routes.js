export default {
    userLogs() {
        return '/report/user-logs';
    },
    userLogsExport({ format = 'csv', start = '', end = '' } = {}) {
        const q = new URLSearchParams();
        if (format) q.set('format', format);
        if (start) q.set('start', start);
        if (end) q.set('end', end);
        return (
            '/report/user-logs/export' +
            (q.toString() ? '?' + q.toString() : '')
        );
    },
    userLogsGraph() {
        return '/report/user-logs/graph';
    },

    computerUse() {
        return '/report/computer-use';
    },
    computerUseExport({ format = 'csv', start = '', end = '' } = {}) {
        const q = new URLSearchParams();
        if (format) q.set('format', format);
        if (start) q.set('start', start);
        if (end) q.set('end', end);
        return (
            '/report/computer-use/export' +
            (q.toString() ? '?' + q.toString() : '')
        );
    },
    computerUseGraph() {
        return '/report/computer-use/graph';
    },
};
