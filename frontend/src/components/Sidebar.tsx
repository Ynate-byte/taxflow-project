import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    FileBarChart, 
    Users, 
    Building, 
    CalendarDays, 
    Cog, 
    LogOut, 
    VenetianMask, 
    ChevronLeft,
    Shield
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Bảng điều khiển' },
    { to: '/invoices', icon: FileText, text: 'Hóa đơn' },
    { to: '/reports', icon: FileBarChart, text: 'Lịch sử Báo cáo' },
    { to: '/partners', icon: Users, text: 'Đối tác' },
    { to: '/tasks', icon: CalendarDays, text: 'Công việc' },
    { to: '/settings', icon: Cog, text: 'Cài đặt' },
];

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
    const { user, logout } = useAuth();

    return (
        <aside className={`flex-shrink-0 bg-gray-800 text-gray-300 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="h-16 flex items-center justify-center bg-gray-900 shadow-md relative">
                <VenetianMask className="h-8 w-8 text-indigo-400" />
                <h1 className={`ml-3 text-2xl font-bold text-white overflow-hidden transition-all ${isOpen ? 'w-32' : 'w-0'}`}>
                    TaxFlow
                </h1>
                <button onClick={toggleSidebar} className="absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-700 rounded-full text-white hover:bg-indigo-500 z-10">
                    <ChevronLeft className={`transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} size={16} />
                </button>
            </div>

            <nav className="flex-grow mt-6">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        title={isOpen ? '' : item.text} // Hiển thị tooltip khi thu gọn
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 my-1 transition-colors duration-200 ${
                                isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className={`ml-4 font-medium overflow-hidden transition-all whitespace-nowrap ${isOpen ? 'w-full' : 'w-0'}`}>{item.text}</span>
                    </NavLink>
                ))}
                {user?.role === 'QUANTRIVIEN' && (
                     <>
                        <NavLink
                            to="/users"
                            title={isOpen ? '' : "Quản lý Người dùng"}
                            className={({ isActive }) =>
                                `flex items-center px-6 py-3 my-1 transition-colors duration-200 ${
                                    isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 hover:text-white'
                                }`
                            }
                        >
                            <Shield className="h-5 w-5 flex-shrink-0" />
                            <span className={`ml-4 font-medium overflow-hidden transition-all whitespace-nowrap ${isOpen ? 'w-full' : 'w-0'}`}>Quản lý Người dùng</span>
                        </NavLink>

                        <NavLink
                            to="/audit-log"
                            title={isOpen ? '' : "Nhật ký hệ thống"}
                            className={({ isActive }) =>
                                `flex items-center px-6 py-3 my-1 transition-colors duration-200 ${
                                    isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 hover:text-white'
                                }`
                            }
                        >
                            <Building className="h-5 w-5 flex-shrink-0" />
                            <span className={`ml-4 font-medium overflow-hidden transition-all whitespace-nowrap ${isOpen ? 'w-full' : 'w-0'}`}>Nhật ký hệ thống</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className={`p-4 border-t border-gray-700 overflow-hidden`}>
                 <div className="text-center">
                    <p className={`text-sm font-semibold text-white truncate transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{user?.hoVaTen}</p>
                    <p className={`text-xs text-gray-400 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{user?.role}</p>
                </div>
                <button
                    onClick={logout}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/40 hover:text-white transition-colors"
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span className={`ml-3 font-medium overflow-hidden transition-all whitespace-nowrap ${isOpen ? 'w-full' : 'w-0'}`}>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
