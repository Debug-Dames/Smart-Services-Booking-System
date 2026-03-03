import React, { useEffect, useMemo, useState } from 'react'
import adminApi from '../api/adminApi'
import bookingApi from '../api/bookingApi'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PIE_COLORS = ['#1952A6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
})

const toAmount = (value) => {
    const amount = Number(value)
    return Number.isFinite(amount) ? amount : 0
}

const normalizeDate = (value) => {
    if (!value) return null
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
    const fallback = new Date(`${value}T00:00:00`)
    return Number.isNaN(fallback.getTime()) ? null : fallback
}

const getBookingAmount = (booking) =>
    toAmount(booking.amount ?? booking.total ?? booking.price ?? booking.servicePrice)

const getServiceName = (booking) => booking.serviceName || booking.service || 'Unknown Service'

const isSameDay = (date, target) =>
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()

const getStartOfWeek = (date) => {
    const start = new Date(date)
    const offset = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - offset)
    start.setHours(0, 0, 0, 0)
    return start
}

const getCircleSlicePath = (centerX, centerY, radius, startAngle, endAngle) => {
    const start = {
        x: centerX + radius * Math.cos(startAngle),
        y: centerY + radius * Math.sin(startAngle),
    }
    const end = {
        x: centerX + radius * Math.cos(endAngle),
        y: centerY + radius * Math.sin(endAngle),
    }
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

const StatCard = ({ title, value, subtitle }) => (
    <article className="admin-card stat-card">
        <h3>{title}</h3>
        <p className="stat-number">{value}</p>
        {subtitle ? <p className="stat-subtext">{subtitle}</p> : null}
    </article>
)

const BarChart = ({ title, data }) => {
    const maxValue = Math.max(...data.map((item) => item.value), 1)

    return (
        <article className="admin-card chart-card">
            <h3>{title}</h3>
            <div className="bar-chart" role="img" aria-label={title}>
                {data.map((item) => (
                    <div key={item.label} className="bar-chart-item">
                        <div className="bar-track">
                            <div
                                className="bar-fill"
                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                                title={`${item.label}: ${item.value}`}
                            />
                        </div>
                        <span className="bar-label">{item.label}</span>
                        <strong className="bar-value">{item.value}</strong>
                    </div>
                ))}
            </div>
        </article>
    )
}

const LineChart = ({ title, data }) => {
    const width = 560
    const height = 220
    const padding = 24
    const maxValue = Math.max(...data.map((item) => item.value), 1)
    const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0

    const points = data.map((item, index) => {
        const x = padding + stepX * index
        const y = height - padding - (item.value / maxValue) * (height - padding * 2)
        return { ...item, x, y }
    })

    const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ')

    return (
        <article className="admin-card chart-card">
            <h3>{title}</h3>
            <div className="line-chart-wrap">
                <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label={title}>
                    <polyline points={polylinePoints} className="line-path" />
                    {points.map((point) => (
                        <circle key={point.label} cx={point.x} cy={point.y} r="4" className="line-point">
                            <title>
                                {point.label}: {CURRENCY_FORMATTER.format(point.value)}
                            </title>
                        </circle>
                    ))}
                </svg>
                <div className="line-labels">
                    {data.map((item) => (
                        <div key={item.label} className="line-label-item">
                            <span>{item.label}</span>
                            <strong>{CURRENCY_FORMATTER.format(item.value)}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    )
}

const PieChart = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const size = 220
    const center = size / 2
    const radius = 90
    const slices = data.reduce(
        (acc, item, index) => {
            const angle = (item.value / total) * Math.PI * 2
            const endAngle = acc.nextAngle + angle
            acc.items.push({
                label: item.label,
                value: item.value,
                color: PIE_COLORS[index % PIE_COLORS.length],
                path: getCircleSlicePath(center, center, radius, acc.nextAngle, endAngle),
            })
            acc.nextAngle = endAngle
            return acc
        },
        { nextAngle: -Math.PI / 2, items: [] },
    ).items

    return (
        <article className="admin-card chart-card">
            <h3>{title}</h3>
            <div className="pie-chart-wrap">
                <svg viewBox={`0 0 ${size} ${size}`} className="pie-chart" role="img" aria-label={title}>
                    {slices.map((slice) => (
                        <path key={slice.label} d={slice.path} fill={slice.color}>
                            <title>
                                {slice.label}: {slice.value}
                            </title>
                        </path>
                    ))}
                    <circle cx={center} cy={center} r="44" fill="#FFFFFF" />
                    <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="pie-total-label">
                        {total}
                    </text>
                </svg>
                <ul className="pie-legend">
                    {slices.map((slice) => (
                        <li key={slice.label}>
                            <span className="legend-dot" style={{ backgroundColor: slice.color }} />
                            <span>{slice.label}</span>
                            <strong>{slice.value}</strong>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    )
}

const DashboardCharts = ({ bookingByDay, revenueTrend, mostBookedServices }) => (
    <div className="chart-grid">
        <BarChart title="Bookings Per Day (Last 7 Days)" data={bookingByDay} />
        <LineChart title="Revenue Trend (Last 7 Days)" data={revenueTrend} />
        <PieChart title="Most Booked Services" data={mostBookedServices} />
    </div>
)

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([])
    const [users, setUsers] = useState([])
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        const loadData = async () => {
            try {
                const [bookingData, userData, serviceData] = await Promise.all([
                    bookingApi.fetchBookings(),
                    adminApi.fetchUsers(),
                    adminApi.fetchServices(),
                ])

                if (!mounted) return
                setBookings(Array.isArray(bookingData) ? bookingData : [])
                setUsers(Array.isArray(userData) ? userData : [])
                setServices(Array.isArray(serviceData) ? serviceData : [])
            } catch (error) {
                console.error('Failed to load dashboard data', error)
                if (!mounted) return
                setBookings([])
                setUsers([])
                setServices([])
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadData()
        return () => {
            mounted = false
        }
    }, [])

    const metrics = useMemo(() => {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfWeek = getStartOfWeek(now)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        let todayCount = 0
        let weekCount = 0
        let monthCount = 0
        let revenue = 0

        const dayMap = new Map()
        const revenueMap = new Map()
        const serviceMap = new Map()

        for (let i = 6; i >= 0; i -= 1) {
            const date = new Date(startOfToday)
            date.setDate(startOfToday.getDate() - i)
            const key = date.toISOString().slice(0, 10)
            dayMap.set(key, 0)
            revenueMap.set(key, 0)
        }

        bookings.forEach((booking) => {
            const date = normalizeDate(booking.date || booking.bookingDate || booking.createdAt)
            if (!date) return

            if (isSameDay(date, now)) todayCount += 1
            if (date >= startOfWeek) weekCount += 1
            if (date >= startOfMonth) monthCount += 1

            const amount = getBookingAmount(booking)
            revenue += amount

            const dateKey = date.toISOString().slice(0, 10)
            if (dayMap.has(dateKey)) {
                dayMap.set(dateKey, dayMap.get(dateKey) + 1)
                revenueMap.set(dateKey, revenueMap.get(dateKey) + amount)
            }

            const service = getServiceName(booking)
            serviceMap.set(service, (serviceMap.get(service) || 0) + 1)
        })

        const bookingsPerDay = Array.from(dayMap.entries()).map(([key, value]) => ({
            label: DAY_LABELS[new Date(`${key}T00:00:00`).getDay()],
            value,
        }))

        const revenueTrend = Array.from(revenueMap.entries()).map(([key, value]) => ({
            label: DAY_LABELS[new Date(`${key}T00:00:00`).getDay()],
            value,
        }))

        const mostBookedServices = Array.from(serviceMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value]) => ({ label, value }))

        const registeredCustomers = users.filter((user) => {
            const role = String(user.role || '').toLowerCase()
            return role !== 'admin' && role !== 'staff' && role !== 'stylist'
        }).length

        const staffMembers = users.filter((user) => {
            const role = String(user.role || '').toLowerCase()
            return role === 'admin' || role === 'staff' || role === 'stylist'
        }).length

        return {
            todayCount,
            weekCount,
            monthCount,
            totalRevenue: revenue,
            activeServices: services.filter((service) => service.isActive !== false).length,
            registeredCustomers: registeredCustomers || users.length,
            staffMembers,
            bookingsPerDay,
            revenueTrend,
            mostBookedServices: mostBookedServices.length
                ? mostBookedServices
                : [{ label: 'No bookings yet', value: 1 }],
        }
    }, [bookings, services, users])

    return (
        <section className="admin-page">
            <div className="admin-page-header">
                <h1>Dashboard Overview</h1>
            </div>

            {loading ? (
                <div className="admin-card">
                    <p>Loading dashboard data...</p>
                </div>
            ) : (
                <>
                    <div className="stats-grid stats-grid-expanded">
                        <StatCard title="Total Bookings" value={metrics.todayCount} subtitle={`Today • ${metrics.weekCount} this week • ${metrics.monthCount} this month`} />
                        <StatCard title="Total Revenue" value={CURRENCY_FORMATTER.format(metrics.totalRevenue)} />
                        <StatCard title="Active Services" value={metrics.activeServices} />
                        <StatCard title="Registered Customers" value={metrics.registeredCustomers} />
                        <StatCard title="Staff Members" value={metrics.staffMembers} />
                    </div>

                    <DashboardCharts
                        bookingByDay={metrics.bookingsPerDay}
                        revenueTrend={metrics.revenueTrend}
                        mostBookedServices={metrics.mostBookedServices}
                    />
                </>
            )}
        </section>
    )
}

export default AdminDashboard
