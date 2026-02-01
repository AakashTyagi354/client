"use client";

import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectToken } from '@/redux/userSlice';
import { useToast } from '@/components/ui/use-toast';

import WidthWrapper from "@/components/WidthWrapper";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalIcon, Clock, LucideHistory, CheckCircle2, Search } from "lucide-react";
import dayjs from "dayjs";
import axiosInstance from '@/app/login/axiosInstance';

export default function CreateSlotPage() {
    const { toast } = useToast();
    const user = useSelector(selectUser);
    const token = useSelector(selectToken);
    
    const [loading, setLoading] = useState(false);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [existingSlots, setExistingSlots] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        date: dayjs().format("YYYY-MM-DD"),
        startTime: "09:00",
        endTime: "17:00",
        duration: 30,
    });

    // 1. ACTION: Fetch slots only when button is clicked
    const handleFetchExisting = async () => {
        if (!user?.id || !token) {
            toast({ variant: "destructive", description: "Auth details missing." });
            return;
        }
        
        setFetchingSlots(true);
        try {
            const response = await axiosInstance.get(`http://localhost:8089/api/v1/appointments/slots`, {
                params: {
                    doctorId: user.id,
                    date: formData.date
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingSlots(response.data);
            toast({ title: "Schedule Loaded", description: `Showing slots for ${formData.date}` });
        } catch (err) {
            toast({ variant: "destructive", description: "Failed to fetch schedule for this date." });
        } finally {
            setFetchingSlots(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === "duration" ? parseInt(value) : value }));
    };

    // 2. PREVIEW: Calculated locally
    const previewSlots = useMemo(() => {
        if (!formData.startTime || !formData.endTime) return [];
        const slots = [];
        let start = dayjs(`${formData.date} ${formData.startTime}`);
        const end = dayjs(`${formData.date} ${formData.endTime}`);
        while (start.isBefore(end)) {
            slots.push(start.format("HH:mm"));
            start = start.add(formData.duration, 'minute');
        }
        return slots;
    }, [formData]);

    const handleCreateSlots = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post(
                'http://localhost:8089/api/v1/slots/create',
                {}, 
                {
                    params: {
                        doctorId: user?.id,
                        date: formData.date,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        slotDurationMinutes: formData.duration,
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast({ title: "Success", description: "Slots generated successfully." });
            handleFetchExisting(); // Auto-refresh the list after creation
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: "Could not create slots." });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Page Header */}
            <div className="w-full bg-[#78355b] py-12 text-white">
                <WidthWrapper>
                    <h1 className="text-3xl font-bold">Manage Your Schedule</h1>
                    <p className="opacity-80 mt-2 text-lg italic">"Your time is the bridge to patient health."</p>
                </WidthWrapper>
            </div>

            <WidthWrapper className="-mt-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT SIDE: CREATION FORM */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <form onSubmit={handleCreateSlots} className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-grow space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Select Date to Manage</label>
                                        <input 
                                            type="date" name="date" required value={formData.date}
                                            min={dayjs().format("YYYY-MM-DD")}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#78355b] outline-none"
                                        />
                                    </div>
                                    {/* NEW BUTTON: FETCH SCHEDULE */}
                                    <Button 
                                        type="button" 
                                        onClick={handleFetchExisting}
                                        className="bg-[#007291] hover:bg-[#005a72] h-[52px] px-6"
                                        disabled={fetchingSlots}
                                    >
                                        {fetchingSlots ? <Loader2 className="animate-spin" /> : <><Search className="mr-2" size={18}/> Check Existing</>}
                                    </Button>
                                </div>

                                <hr className="border-gray-100" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Clock size={14} className="text-green-600"/> Start Time</label>
                                        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Clock size={14} className="text-red-600"/> End Time</label>
                                        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-3 border rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><LucideHistory size={14}/> Duration</label>
                                        <select name="duration" value={formData.duration} onChange={(e) => setFormData(p=>({...p, duration: parseInt(e.target.value)}))} className="w-full p-3 border rounded-lg bg-white">
                                            <option value={15}>15 Mins</option>
                                            <option value={30}>30 Mins</option>
                                            <option value={45}>45 Mins</option>
                                        </select>
                                    </div>
                                </div>

                                <Button disabled={loading} className="w-full bg-[#78355b] hover:bg-[#5e2947] h-12 text-lg font-bold shadow-md">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                                    Create New Slots for {formData.date}
                                </Button>
                            </form>
                        </div>

                        {/* PREVIEW BOX */}
                        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-6">
                            <p className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest"><CalIcon size={16}/> New Generation Preview</p>
                            <div className="flex flex-wrap gap-2">
                                {previewSlots.map((t, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded text-xs font-mono">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: EXISTING LIST */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 min-h-[500px] flex flex-col">
                        <div className="p-6 border-b bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-800">Confirmed Schedule</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter mt-1">{dayjs(formData.date).format("dddd, MMM D")}</p>
                        </div>
                        
                        <div className="p-4 flex-grow overflow-y-auto max-h-[550px]">
                            {fetchingSlots ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <Loader2 className="animate-spin mb-2" />
                                    <p className="text-sm font-medium italic">Scanning Delma database...</p>
                                </div>
                            ) : existingSlots.length > 0 ? (
                                <div className="space-y-2">
                                    {existingSlots.map((slot: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm hover:border-[#007291] transition group">
                                            <span className="font-bold text-gray-700 text-sm">{slot.startTime}</span>
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${slot.booked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {slot.booked ? 'Booked' : 'Available'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <CalIcon size={32} />
                                    </div>
                                    <p className="text-gray-400 text-sm">No slots found for this date.</p>
                                    <p className="text-xs text-gray-400 mt-1">Use "Check Existing" to refresh.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </WidthWrapper>
        </div>
    );
}