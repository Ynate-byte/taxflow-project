import { useEffect, useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, EventProps, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/vi';
import { useForm, SubmitHandler } from "react-hook-form";
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Check, Edit, Trash2, X } from 'lucide-react';

// --- Interfaces ---
interface Task {
    Id: number;
    TieuDe: string;
    MoTa: string | null;
    HanChot: string;
    TrangThai: 'DANGCHOLAM' | 'HOANTHANH';
    NguoiDung?: { HoVaTen: string };
    IdNguoiThucHien: number;
}

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: Task;
}

interface UserAccount {
    Id: number;
    HoVaTen: string;
}

// Thêm kiểu dữ liệu cho user object lấy từ context
interface AuthUser {
    role: string;
    hoVaTen?: string;
    // Thêm các trường khác nếu cần
}

type TaskFormData = {
    TieuDe: string;
    MoTa: string;
    HanChot: string;
    IdNguoiThucHien: number;
};

// --- Component cho từng sự kiện trên lịch ---
const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
    const isDone = event.resource.TrangThai === 'HOANTHANH';
    return (
        <div className={`h-full p-1 rounded-sm text-xs ${isDone ? 'bg-green-100 text-gray-500 line-through' : 'bg-blue-100 text-blue-800'}`}>
            <strong className="font-semibold">{event.title}</strong>
            {event.resource.NguoiDung && <p className="italic">Cho: {event.resource.NguoiDung.HoVaTen}</p>}
        </div>
    );
};

// --- Component Modal ---
const TaskModal = ({ isOpen, onClose, onSubmit, onDelete, onToggleStatus, defaultTaskData, users, user }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<TaskFormData>;
    onDelete: (id: number) => void;
    onToggleStatus: (task: Task) => void;
    defaultTaskData: Partial<TaskFormData> & { Id?: number; TrangThai?: string };
    users: UserAccount[];
    user: AuthUser | null;
}) => {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<TaskFormData>({
        defaultValues: defaultTaskData
    });

    useEffect(() => {
        reset(defaultTaskData);
    }, [defaultTaskData, reset]);

    if (!isOpen) return null;
    const isEditing = !!defaultTaskData.Id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Chi tiết công việc' : 'Tạo công việc mới'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                        <input {...register("TieuDe", { required: true })} className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea {...register("MoTa")} className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-indigo-500 focus:border-indigo-500" rows={3}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hạn chót</label>
                        <input {...register("HanChot", { required: true })} type="date" className="w-full p-2 border border-gray-300 rounded-md mt-1 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giao cho</label>
                        <select {...register("IdNguoiThucHien", { valueAsNumber: true, required: true })} className="w-full p-2 border border-gray-300 rounded-md bg-white mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">-- Chọn người thực hiện --</option>
                            {users.map(u => <option key={u.Id} value={u.Id}>{u.HoVaTen}</option>)}
                        </select>
                    </div>
                     <div className="flex justify-between items-center pt-4">
                        <div>
                            {isEditing && (
                                <button type="button" onClick={() => onToggleStatus(defaultTaskData as Task)}
                                    className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${defaultTaskData.TrangThai === 'HOANTHANH' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}>
                                    <Check size={16} />
                                    {defaultTaskData.TrangThai === 'HOANTHANH' ? 'Mở lại' : 'Hoàn thành'}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {isEditing && user?.role === 'QUANTRIVIEN' && (
                                <button type="button" onClick={() => onDelete(defaultTaskData.Id!)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center gap-2"><Trash2 size={16}/>Xóa</button>
                            )}
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold disabled:bg-gray-400 flex items-center gap-2"><Edit size={16}/>{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Trang Lịch chính ---
const TasksCalendarPage = () => {
    const localizer = useMemo(() => momentLocalizer(moment), []);
    const { user } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<Partial<TaskFormData> & { Id?: number; TrangThai?: string }>({});
    const [companyUsers, setCompanyUsers] = useState<UserAccount[]>([]);

    const fetchAllData = useCallback(async () => {
        try {
            const [tasksResponse, usersResponse] = await Promise.all([
                api.get('/tasks'),
                api.get('/users/company')
            ]);
            const formattedEvents = tasksResponse.data.map((task: Task): CalendarEvent => ({
                id: task.Id,
                title: task.TieuDe,
                start: new Date(task.HanChot),
                end: new Date(task.HanChot),
                allDay: true,
                resource: task,
            }));
            setEvents(formattedEvents);
            setCompanyUsers(usersResponse.data);
        } catch (error) {
            console.error("Không thể tải dữ liệu cho trang Lịch Công việc", error);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        if (user?.role !== 'QUANTRIVIEN') return;
        setModalData({ HanChot: moment(slotInfo.start).format('YYYY-MM-DD') });
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setModalData({
            Id: event.resource.Id,
            TieuDe: event.resource.TieuDe,
            MoTa: event.resource.MoTa || '',
            HanChot: moment(event.resource.HanChot).format('YYYY-MM-DD'),
            IdNguoiThucHien: event.resource.IdNguoiThucHien,
            TrangThai: event.resource.TrangThai,
        });
        setIsModalOpen(true);
    };

    const handleModalSubmit: SubmitHandler<TaskFormData> = async (data) => {
        const payload = { ...data, HanChot: moment(data.HanChot).toISOString() };
        try {
            if (modalData.Id) {
                await api.put(`/tasks/${modalData.Id}`, payload);
                alert('Cập nhật công việc thành công!');
            } else {
                await api.post('/tasks', payload);
                alert('Tạo công việc thành công!');
            }
            setIsModalOpen(false);
            fetchAllData();
        } catch (error) {
            alert('Thao tác thất bại.');
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (window.confirm("Bạn có chắc muốn xóa công việc này?")) {
            try {
                await api.delete(`/tasks/${id}`);
                alert('Xóa thành công!');
                setIsModalOpen(false);
                fetchAllData();
            } catch (error) {
                alert('Xóa thất bại.');
            }
        }
    };

    const handleToggleStatus = async (task: Task) => {
        const newStatus = task.TrangThai === 'HOANTHANH' ? 'DANGCHOLAM' : 'HOANTHANH';
        try {
            await api.put(`/tasks/${task.Id}`, { TrangThai: newStatus });
            alert('Cập nhật trạng thái thành công!');
            setIsModalOpen(false);
            fetchAllData();
        } catch (error) {
            alert('Cập nhật trạng thái thất bại.');
        }
    };

    return (
        <div className="bg-white h-[calc(100vh-4rem)] flex flex-col rounded-lg shadow-sm">
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                defaultTaskData={modalData}
                users={companyUsers}
                user={user}
            />
            <div className="p-4 border-b flex justify-between items-center">
                 <h1 className="text-xl font-bold text-gray-800">Lịch Công việc</h1>
                {user?.role === 'QUANTRIVIEN' && <p className="text-sm text-gray-500">Nhấn vào ngày trống để tạo việc mới, hoặc nhấn vào việc đã có để sửa.</p>}
            </div>
            <div className="flex-grow p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    selectable={user?.role === 'QUANTRIVIEN'}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    messages={{
                        next: "Sau",
                        previous: "Trước",
                        today: "Hôm nay",
                        month: "Tháng",
                        week: "Tuần",
                        day: "Ngày",
                        agenda: "Lịch trình",
                        noEventsInRange: "Không có công việc trong khoảng thời gian này."
                    }}
                    components={{
                        event: EventComponent
                    }}
                    popup
                />
            </div>
        </div>
    );
};

export default TasksCalendarPage;
