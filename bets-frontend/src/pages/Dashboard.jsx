import StatsDashboard from '../components/StatsDashboard';
import BetsTable from '../components/BetsTable';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <StatsDashboard />
            <BetsTable />
        </div>
    );
}
