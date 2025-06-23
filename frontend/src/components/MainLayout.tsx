import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Truyền state và hàm toggle vào Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8">
                    {/* Outlet sẽ render các trang con */}
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
