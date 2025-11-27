import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { 
  Users, DollarSign, AlertCircle, PlusCircle, Search, Trash2, 
  Send, School, ArrowLeft 
} from 'lucide-react';
import { Student, Screen, CLASS_OPTIONS, STORAGE_KEY, CORRECT_PASSWORD, WHATSAPP_NUMBER } from './types';
import Layout from './components/Layout';
import { Card, Button, Input, Select } from './components/UIComponents';

const App: React.FC = () => {
  // --- State ---
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [students, setStudents] = useState<Student[]>([]);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    classGrade: '',
    totalFees: '',
    paidFees: ''
  });

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // --- Effects ---

  // Load data from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStudents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  // Save data to LocalStorage on change
  useEffect(() => {
    if (screen !== Screen.SPLASH) { // Don't overwrite on initial load empty state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }
  }, [students, screen]);

  // Splash Screen Timer
  useEffect(() => {
    if (screen === Screen.SPLASH) {
      const timer = setTimeout(() => {
        setScreen(Screen.LOGIN);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // --- Actions ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setScreen(Screen.DASHBOARD);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  const handleLogout = () => {
    setScreen(Screen.LOGIN);
    setPassword('');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(formData.totalFees);
    const paid = Number(formData.paidFees);
    
    const newStudent: Student = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      classGrade: formData.classGrade,
      totalFees: total,
      paidFees: paid,
      dueFees: total - paid
    };

    if (editingId) {
      setStudents(students.map(s => s.id === editingId ? newStudent : s));
      setEditingId(null);
    } else {
      setStudents([...students, newStudent]);
    }

    // Reset Form
    setFormData({ name: '', classGrade: '', totalFees: '', paidFees: '' });
    
    // Go back to relevant screen or stay (if editing)
    if (editingId) {
      setScreen(Screen.VIEW_STUDENTS);
    } else {
      alert('Student Added Successfully!');
    }
  };

  const startEdit = (student: Student) => {
    setFormData({
      name: student.name,
      classGrade: student.classGrade,
      totalFees: student.totalFees.toString(),
      paidFees: student.paidFees.toString()
    });
    setEditingId(student.id);
    setScreen(Screen.ADD_STUDENT);
  };

  const removeStudent = (id: string) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const sendWhatsAppReminder = () => {
    const dueStudents = students.filter(s => s.dueFees > 0);
    if (dueStudents.length === 0) return;

    const names = dueStudents.map(s => `${s.name}(${s.classGrade})`).join(', ');
    const text = encodeURIComponent(`Following students have pending fees: ${names}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  // --- Derived Data for Dashboard ---
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalCollection = students.reduce((acc, s) => acc + s.paidFees, 0);
    const totalDue = students.reduce((acc, s) => acc + s.dueFees, 0);
    
    // Data for graphs
    const classData = CLASS_OPTIONS.map(cls => {
      const classStudents = students.filter(s => s.classGrade === cls);
      return {
        name: cls,
        students: classStudents.length,
        collected: classStudents.reduce((acc, s) => acc + s.paidFees, 0),
        due: classStudents.reduce((acc, s) => acc + s.dueFees, 0)
      };
    });

    return { totalStudents, totalCollection, totalDue, classData };
  }, [students]);


  // --- Renderers ---

  if (screen === Screen.SPLASH) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-900 to-brand-700 flex flex-col items-center justify-center text-white">
        <div className="animate-bounce mb-8">
           <School className="w-24 h-24" />
        </div>
        <h1 className="text-3xl font-bold tracking-wider mb-2 text-center px-4 animate-[fadeIn_2s_ease-in]">
          Shivsadhana Education Academy
        </h1>
        <p className="text-brand-200 text-sm tracking-widest uppercase">Empowering Future Leaders</p>
      </div>
    );
  }

  if (screen === Screen.LOGIN) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-100 p-4 rounded-full">
              <Users className="w-8 h-8 text-brand-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-center text-gray-500 mb-8">Shivsadhana Education Academy</p>
          
          <form onSubmit={handleLogin}>
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-6"
            />
            {loginError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Incorrect password. Please try again.
              </div>
            )}
            <Button type="submit" className="w-full justify-center">
              Login to Dashboard
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // --- Authenticated Screens ---

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-brand-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Fees Collected</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">₹{stats.totalCollection.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Due Amount</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">₹{stats.totalDue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Students per Class</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.classData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Fees Collection vs Due</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.classData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="due" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex justify-center pt-4 md:hidden">
        <Button onClick={() => setScreen(Screen.ADD_STUDENT)} className="flex items-center gap-2 w-full justify-center">
          <PlusCircle className="w-5 h-5" />
          Add New Student
        </Button>
      </div>
    </div>
  );

  const renderAddStudent = () => {
    // Auto-calculate due fees for display
    const due = (Number(formData.totalFees) || 0) - (Number(formData.paidFees) || 0);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setScreen(Screen.DASHBOARD)} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
        </div>

        <Card className="p-8">
          <form onSubmit={handleAddStudent}>
            <Input 
              label="Student Name"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Rahul Patil"
              required
            />
            
            <Select 
              label="Class"
              options={CLASS_OPTIONS}
              value={formData.classGrade}
              onChange={e => setFormData({...formData, classGrade: e.target.value})}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Total Fees (₹)"
                type="number"
                value={formData.totalFees}
                onChange={e => setFormData({...formData, totalFees: e.target.value})}
                placeholder="0"
                required
                min="0"
              />
              <Input 
                label="Fees Paid (₹)"
                type="number"
                value={formData.paidFees}
                onChange={e => setFormData({...formData, paidFees: e.target.value})}
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <p className="text-sm text-gray-500">Calculated Due Amount</p>
              <p className={`text-xl font-bold ${due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{due.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="secondary" onClick={() => {
                setEditingId(null);
                setFormData({ name: '', classGrade: '', totalFees: '', paidFees: '' });
                setScreen(Screen.DASHBOARD);
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingId ? 'Update Student' : 'Save Student'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  const renderFeesReminder = () => {
    const dueStudents = students.filter(s => s.dueFees > 0);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setScreen(Screen.DASHBOARD)} className="p-2 hover:bg-gray-200 rounded-full md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">Fees Reminders</h2>
          </div>
          <Button onClick={sendWhatsAppReminder} disabled={dueStudents.length === 0} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send WhatsApp Reminder</span>
            <span className="sm:hidden">WhatsApp</span>
          </Button>
        </div>

        {dueStudents.length === 0 ? (
           <Card className="p-12 text-center text-gray-500">
             <div className="flex justify-center mb-4">
               <div className="bg-green-100 p-4 rounded-full text-green-600">
                 <DollarSign className="w-8 h-8" />
               </div>
             </div>
             <h3 className="text-lg font-medium text-gray-900">No Pending Dues!</h3>
             <p>All students have cleared their fees.</p>
           </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueStudents.map(student => (
              <Card key={student.id} className="p-4 border-l-4 border-l-red-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{student.name}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {student.classGrade}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid:</span>
                    <span className="font-medium">₹{student.paidFees}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Due:</span>
                    <span>₹{student.dueFees}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderViewStudents = () => {
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
             <button onClick={() => setScreen(Screen.DASHBOARD)} className="p-2 hover:bg-gray-200 rounded-full md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">All Students</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(student => (
            <Card key={student.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">Class: {student.classGrade}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${student.dueFees > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
              </div>
              
              <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Fees</span>
                  <span className="font-medium">₹{student.totalFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span className="font-medium text-green-600">₹{student.paidFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due</span>
                  <span className="font-medium text-red-600">₹{student.dueFees}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => startEdit(student)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-800"
                >
                  Edit Profile
                </button>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No students found.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRemoveStudents = () => {
    const displayList = filterClass 
      ? students.filter(s => s.classGrade === filterClass)
      : [];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setScreen(Screen.DASHBOARD)} className="p-2 hover:bg-gray-200 rounded-full md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
          <h2 className="text-2xl font-bold text-red-700">Remove Students</h2>
        </div>

        <Card className="p-6 mb-6">
          <p className="text-sm text-gray-600 mb-4">Select a class to view and remove students. This action cannot be undone.</p>
          <Select 
            label="Filter by Class" 
            options={CLASS_OPTIONS} 
            value={filterClass} 
            onChange={e => setFilterClass(e.target.value)}
          />
        </Card>

        {filterClass && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayList.length > 0 ? displayList.map(student => (
              <div key={student.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{student.name}</h3>
                  <p className="text-xs text-gray-500">Due: ₹{student.dueFees}</p>
                </div>
                <Button variant="danger" onClick={() => removeStudent(student.id)} className="text-sm px-3 py-1">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )) : (
              <p className="text-gray-500 col-span-full text-center py-4">No students in {filterClass}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout 
      currentScreen={screen} 
      setScreen={setScreen} 
      onLogout={handleLogout}
    >
      {screen === Screen.DASHBOARD && renderDashboard()}
      {screen === Screen.ADD_STUDENT && renderAddStudent()}
      {screen === Screen.VIEW_STUDENTS && renderViewStudents()}
      {screen === Screen.FEES_REMINDER && renderFeesReminder()}
      {screen === Screen.REMOVE_STUDENTS && renderRemoveStudents()}
    </Layout>
  );
};

export default App;