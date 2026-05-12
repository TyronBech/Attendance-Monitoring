import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import routes from '@/lib/routes';

function BarChart({ points }) {
    if (!points || points.length === 0) return <div>No data</div>;
    const max = Math.max(...points.map((p) => p.total));
    return (
        <div
            style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-end',
                height: 120,
            }}
        >
            {points.map((p) => (
                <div
                    key={p.date}
                    title={`${p.date}: ${p.total}`}
                    style={{
                        width: 20,
                        background: '#059669',
                        height: `${(p.total / max) * 100}%`,
                    }}
                ></div>
            ))}
        </div>
    );
}

export default function ComputerUse() {
    const { props } = usePage();
    const {
        data,
        search,
        fromInputDate,
        toInputDate,
        peak_hour,
        perPage,
        userType,
    } = props;
    const [start, setStart] = useState(fromInputDate || '');
    const [end, setEnd] = useState(toInputDate || '');
    const [points, setPoints] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        fetch(routes.computerUseGraph() + '?' + params.toString())
            .then((r) => r.json())
            .then(setPoints)
            .catch(() => setPoints([]));
    }, [start, end]);

    function applyFilters(e) {
        e && e.preventDefault();
        window.location.href =
            routes.computerUse() + `?start=${start}&end=${end}`;
    }

    return (
        <div>
            <h1>Computer Use Report</h1>
            <form
                onSubmit={applyFilters}
                style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    marginBottom: 12,
                }}
            >
                <label>
                    From{' '}
                    <input
                        type="date"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </label>
                <label>
                    To{' '}
                    <input
                        type="date"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </label>
                <button type="submit">Apply</button>
                <a
                    href={routes.computerUseExport({
                        format: 'csv',
                        start,
                        end,
                    })}
                    style={{ marginLeft: 12 }}
                >
                    Export CSV
                </a>
            </form>

            <div>Search: {search}</div>
            <div>
                Range: {fromInputDate} — {toInputDate}
            </div>
            <div>Peak hour: {peak_hour}</div>

            <h3>Graph</h3>
            <BarChart points={points} />

            <table border="1" cellPadding="6" style={{ marginTop: 12 }}>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Computer Use</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {data.data &&
                        data.data.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    {row.user
                                        ? `${row.user.first_name} ${row.user.last_name}`
                                        : '—'}
                                </td>
                                <td>{row.computer_use}</td>
                                <td>{row.time_in}</td>
                                <td>{row.time_out}</td>
                                <td>{row.remarks}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
                <small>
                    Showing {data.from} — {data.to} of {data.total}
                </small>
            </div>
        </div>
    );
}
