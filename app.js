// 配置信息
let supabase = null;
let supabaseConfig = {
    url: localStorage.getItem('supabase_url') || '',
    key: localStorage.getItem('supabase_key') || ''
};

// 当前登录用户
let currentUser = null;
let currentRole = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化UI元素
    initUI();
    
    // 检查是否已有数据库配置
    if (supabaseConfig.url && supabaseConfig.key) {
        initSupabase();
        showLoginSection();
    }
    
    // 绑定事件
    bindEvents();
});

// 初始化UI元素引用
function initUI() {
    // 获取所有需要的DOM元素
    window.configSection = document.getElementById('configSection');
    window.loginSection = document.getElementById('loginSection');
    window.studentContent = document.getElementById('studentContent');
    window.teacherContent = document.getElementById('teacherContent');
    window.supabaseUrlInput = document.getElementById('supabaseUrl');
    window.supabaseKeyInput = document.getElementById('supabaseKey');
    window.saveConfigBtn = document.getElementById('saveConfig');
    window.initTablesBtn = document.getElementById('initTables');
    window.initStatus = document.getElementById('initStatus');
    
    // 设置输入框的值
    if (supabaseUrlInput) supabaseUrlInput.value = supabaseConfig.url;
    if (supabaseKeyInput) supabaseKeyInput.value = supabaseConfig.key;
}

// 初始化Supabase客户端
function initSupabase() {
    try {
        supabase = window.supabase.createClient(supabaseConfig.url, supabaseConfig.key);
        console.log('Supabase客户端初始化成功');
        return true;
    } catch (error) {
        console.error('Supabase客户端初始化失败:', error);
        return false;
    }
}

// 显示登录界面
function showLoginSection() {
    if (configSection) configSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'flex';
}

// 绑定事件
function bindEvents() {
    // 保存配置按钮
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveConfig);
    }
    
    // 初始化数据库表按钮
    if (initTablesBtn) {
        initTablesBtn.addEventListener('click', initializeTables);
    }
    
    // 登录按钮
    const studentLoginBtn = document.getElementById('studentLogin');
    const teacherLoginBtn = document.getElementById('teacherLogin');
    
    if (studentLoginBtn) studentLoginBtn.addEventListener('click', handleStudentLogin);
    if (teacherLoginBtn) teacherLoginBtn.addEventListener('click', handleTeacherLogin);
    
    // 退出登录按钮
    const studentLogoutBtn = document.getElementById('studentLogout');
    const teacherLogoutBtn = document.getElementById('teacherLogout');
    
    if (studentLogoutBtn) studentLogoutBtn.addEventListener('click', handleLogout);
    if (teacherLogoutBtn) teacherLogoutBtn.addEventListener('click', handleLogout);
    
    // 文件上传
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);
    
    // 审核按钮
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    const closeModal = document.getElementById('closeModal');
    
    if (approveBtn) approveBtn.addEventListener('click', () => handleReview('approved'));
    if (rejectBtn) rejectBtn.addEventListener('click', () => handleReview('rejected'));
    if (closeModal) closeModal.addEventListener('click', () => {
        document.getElementById('reviewModal').style.display = 'none';
    });
}

// 保存配置
async function saveConfig() {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();
    
    if (!url || !key) {
        showNotification('请填写完整的URL和密钥', 'error');
        return;
    }
    
    // 保存到localStorage
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    supabaseConfig.url = url;
    supabaseConfig.key = key;
    
    // 初始化Supabase客户端
    if (initSupabase()) {
        showLoginSection();
        showNotification('数据库配置保存成功！', 'success');
    } else {
        showNotification('配置失败，请检查URL和密钥格式', 'error');
    }
}

// 初始化数据库表
async function initializeTables() {
    if (!supabase) {
        showStatus('请先保存数据库配置', 'error');
        return;
    }
    
    showStatus('正在创建数据库表...', 'info');
    
    try {
        // 创建学生表
        const { error: studentsError } = await supabase
            .from('students')
            .insert([
                { 
                    student_id: 'student123', 
                    name: '张三', 
                    password: '123456', 
                    score: 0 
                }
            ])
            .select();
        
        if (studentsError && !studentsError.message.includes('duplicate key')) {
            throw studentsError;
        }
        
        // 创建教师表
        const { error: teachersError } = await supabase
            .from('teachers')
            .insert([
                { 
                    teacher_id: 'teacher123', 
                    name: '李老师', 
                    password: '123456' 
                }
            ])
            .select();
        
        if (teachersError && !teachersError.message.includes('duplicate key')) {
            throw teachersError;
        }
        
        showStatus('数据库表创建成功！', 'success');
        
        // 添加测试数据
        await addTestData();
        
    } catch (error) {
        showStatus('创建失败，可能是表已存在或其他错误', 'error');
        console.error('创建表错误:', error);
    }
}

// 显示状态
function showStatus(message, type) {
    if (!initStatus) return;
    
    initStatus.innerHTML = `<div class="config-status ${type}">${message}</div>`;
    
    // 3秒后清除状态
    if (type !== 'info') {
        setTimeout(() => {
            initStatus.innerHTML = '';
        }, 3000);
    }
}

// 添加测试数据
async function addTestData() {
    try {
        // 添加更多测试学生
        const students = [
            { student_id: 'student456', name: '李四', password: '123456', score: 80 },
            { student_id: 'student789', name: '王五', password: '123456', score: 150 }
        ];
        
        for (const student of students) {
            const { error } = await supabase
                .from('students')
                .insert([student])
                .select();
            
            if (error && !error.message.includes('duplicate key')) {
                console.error('添加学生失败:', error);
            }
        }
        
        showStatus('测试数据添加完成！', 'success');
    } catch (error) {
        console.error('添加测试数据失败:', error);
    }
}

// 处理学生登录
async function handleStudentLogin() {
    const username = document.getElementById('studentUsername').value.trim();
    const password = document.getElementById('studentPassword').value;
    
    if (!supabase) {
        showNotification('请先配置数据库', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', username)
            .eq('password', password)
            .single();
        
        if (error || !data) {
            showNotification('用户名或密码错误', 'error');
            return;
        }
        
        currentUser = data;
        currentRole = 'student';
        showStudentInterface();
        showNotification('登录成功！', 'success');
        
    } catch (error) {
        console.error('登录错误:', error);
        showNotification('登录失败，请检查网络连接', 'error');
    }
}

// 处理教师登录
async function handleTeacherLogin() {
    const username = document.getElementById('teacherUsername').value.trim();
    const password = document.getElementById('teacherPassword').value;
    
    if (!supabase) {
        showNotification('请先配置数据库', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('teacher_id', username)
            .eq('password', password)
            .single();
        
        if (error || !data) {
            showNotification('用户名或密码错误', 'error');
            return;
        }
        
        currentUser = data;
        currentRole = 'teacher';
        showTeacherInterface();
        showNotification('登录成功！', 'success');
        
    } catch (error) {
        console.error('登录错误:', error);
        showNotification('登录失败，请检查网络连接', 'error');
    }
}

// 显示学生界面
function showStudentInterface() {
    if (loginSection) loginSection.style.display = 'none';
    if (studentContent) studentContent.style.display = 'block';
    if (teacherContent) teacherContent.style.display = 'none';
    
    // 加载学生数据
    loadStudentData();
}

// 显示教师界面
function showTeacherInterface() {
    if (loginSection) loginSection.style.display = 'none';
    if (studentContent) studentContent.style.display = 'none';
    if (teacherContent) teacherContent.style.display = 'block';
    
    // 加载教师数据
    loadTeacherData();
}

// 加载学生数据
async function loadStudentData() {
    if (!currentUser || !supabase) return;
    
    // 更新学生信息
    const studentName = document.getElementById('studentName');
    const studentScore = document.getElementById('studentScore');
    
    if (studentName) studentName.textContent = `学生：${currentUser.name}`;
    if (studentScore) studentScore.textContent = currentUser.score || 0;
    
    // 加载上传记录
    await loadStudentUploads();
}

// 加载教师数据
async function loadTeacherData() {
    // 加载待审核记录
    await loadPendingReviews();
    
    // 加载统计数据
    await loadStatistics();
    
    // 加载排行榜
    await loadScoreRanking();
}

// 加载学生上传记录
async function loadStudentUploads() {
    if (!currentUser || !supabase) return;
    
    try {
        const { data, error } = await supabase
            .from('uploads')
            .select('*')
            .eq('student_id', currentUser.student_id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // 更新界面显示
        updateStudentUploadsUI(data);
        
    } catch (error) {
        console.error('加载上传记录失败:', error);
    }
}

// 更新学生上传记录UI
function updateStudentUploadsUI(uploads) {
    // 实现更新UI的逻辑
    console.log('学生上传记录:', uploads);
    // 这里添加具体的UI更新代码
}

// 加载待审核记录
async function loadPendingReviews() {
    if (!supabase) return;
    
    try {
        const { data, error } = await supabase
            .from('uploads')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // 更新界面显示
        updatePendingReviewsUI(data);
        
    } catch (error) {
        console.error('加载待审核记录失败:', error);
    }
}

// 加载统计数据
async function loadStatistics() {
    if (!supabase) return;
    
    try {
        // 获取总学生数
        const { count: totalStudents, error: studentsError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });
        
        // 获取待审核数
        const { count: pendingCount, error: pendingError } = await supabase
            .from('uploads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        
        // 获取已通过数
        const { count: approvedCount, error: approvedError } = await supabase
            .from('uploads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');
        
        // 更新UI
        const totalStudentsEl = document.getElementById('totalStudents');
        const pendingReviewsEl = document.getElementById('pendingReviews');
        const approvedCountEl = document.getElementById('approvedCount');
        
        if (totalStudentsEl) totalStudentsEl.textContent = totalStudents || 0;
        if (pendingReviewsEl) pendingReviewsEl.textContent = pendingCount || 0;
        if (approvedCountEl) approvedCountEl.textContent = approvedCount || 0;
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 加载积分排行榜
async function loadScoreRanking() {
    if (!supabase) return;
    
    try {
        const { data, error } = await supabase
            .from('students')
            .select('name, score')
            .order('score', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        // 更新UI
        updateScoreRankingUI(data);
        
    } catch (error) {
        console.error('加载排行榜失败:', error);
    }
}

// 处理文件上传
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !currentUser) return;
    
    // 检查文件类型和大小
    if (!file.type.startsWith('image/')) {
        showNotification('请上传图片文件', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('图片大小不能超过5MB', 'error');
        return;
    }
    
    try {
        // 将图片转换为Base64
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64Image = e.target.result;
            
            // 保存到数据库
            const { data, error } = await supabase
                .from('uploads')
                .insert([{
                    student_id: currentUser.student_id,
                    student_name: currentUser.name,
                    image_url: base64Image,
                    status: 'pending',
                    upload_date: new Date().toISOString().split('T')[0],
                    week_number: getWeekNumber(new Date())
                }])
                .select();
            
            if (error) throw error;
            
            showNotification('照片上传成功！等待审核中...', 'success');
            
            // 刷新数据
            await loadStudentUploads();
            
            // 重置文件输入
            event.target.value = '';
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('上传失败:', error);
        showNotification('上传失败，请重试', 'error');
    }
}

// 处理审核
async function handleReview(status) {
    // 这里实现审核逻辑
    console.log('审核状态:', status);
    // 具体实现需要获取当前审核的记录ID
}

// 获取周数
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// 显示通知
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 处理退出登录
function handleLogout() {
    currentUser = null;
    currentRole = null;
    
    // 清空登录表单
    const studentUsername = document.getElementById('studentUsername');
    const studentPassword = document.getElementById('studentPassword');
    const teacherUsername = document.getElementById('teacherUsername');
    const teacherPassword = document.getElementById('teacherPassword');
    
    if (studentUsername) studentUsername.value = '';
    if (studentPassword) studentPassword.value = '';
    if (teacherUsername) teacherUsername.value = '';
    if (teacherPassword) teacherPassword.value = '';
    
    // 显示登录界面
    if (loginSection) loginSection.style.display = 'flex';
    if (studentContent) studentContent.style.display = 'none';
    if (teacherContent) teacherContent.style.display = 'none';
    
    showNotification('已退出登录', 'success');
}

// 在window对象上暴露必要的方法
window.showReviewModal = function(index) {
    // 显示审核弹窗
    const modal = document.getElementById('reviewModal');
    if (modal) modal.style.display = 'flex';
    // 这里需要加载具体的数据
};

window.handleReview = function(status) {
    // 处理审核
    console.log('审核状态:', status);
};
