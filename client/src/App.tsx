import { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Form, Navbar, Container } from 'react-bootstrap';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import gcampLogo from './assets/gcamp_logo.svg';
import gcampNameLogo from './assets/gcamp_name_logo.svg';
import './App.css';

// Custom hooks
import { useAuth } from './hooks/useAuth';
import { useTools } from './hooks/useTools';
import { useAlert } from './hooks/useAlert';

// Components
import ToolCard from './components/ToolCard';
import CustomAlert from './components/CustomAlert';
import AuthModal from './components/AuthModal';
import ToolModal from './components/ToolModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import LoadingSpinner from './components/LoadingSpinner';
import SkeletonCard from './components/SkeletonCard';

// Types
import type { Tool, NewTool, ToolFormData } from './types/index.js';

// Utils
import { validateName, validateUrl, validateDescription, validateEmail, validatePassword, sanitizeInput } from './utils/validation';

function App() {
  // Custom hooks
  const { isAdmin, email, password, setEmail, setPassword, login, logout } = useAuth();
  const { tools, isReordering, fetchTools, addTool, updateTool, deleteTool, toggleToolVisibility, reorderTools } = useTools();
  const { alertState, showAlert, hideAlert } = useAlert();

  // Local state
  const [newTool, setNewTool] = useState<NewTool>({ name: '', url: '', description: '' });
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoized values
  const visibleTools = useMemo(() => 
    tools.filter(tool => isAdmin || !tool.is_hidden), 
    [tools, isAdmin]
  );

  // Effects
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Event handlers
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Validation
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);
      
      if (!emailValidation.isValid) {
        showAlert(emailValidation.error!, 'error');
        return;
      }
      
      if (!passwordValidation.isValid) {
        showAlert(passwordValidation.error!, 'error');
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        showAlert('관리자로 로그인되었습니다!');
        setEmail('');
        setPassword('');
        setShowLoginModal(false);
      } else {
        showAlert(result.error!, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, login, setEmail, setPassword, showAlert]);

  const handleLogout = useCallback(async () => {
    const result = await logout();
    if (result.success) {
      showAlert('로그아웃되었습니다.');
      setShowLoginModal(false);
      setShowAddEditModal(false);
      setEditingTool(null);
      setNewTool({ name: '', url: '', description: '' });
    } else {
      showAlert(result.error!, 'error');
    }
  }, [logout, showAlert]);

  const handleAddTool = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Validation
      const nameValidation = validateName(newTool.name);
      const urlValidation = validateUrl(newTool.url);
      const descriptionValidation = validateDescription(newTool.description);
      
      if (!nameValidation.isValid) {
        showAlert(nameValidation.error!, 'error');
        return;
      }
      
      if (!urlValidation.isValid) {
        showAlert(urlValidation.error!, 'error');
        return;
      }
      
      if (!descriptionValidation.isValid) {
        showAlert(descriptionValidation.error!, 'error');
        return;
      }

      // Sanitize inputs
      const sanitizedTool = {
        name: sanitizeInput(newTool.name),
        url: newTool.url.trim(),
        description: sanitizeInput(newTool.description)
      };

      const result = await addTool(sanitizedTool);
      if (result.success) {
        setNewTool({ name: '', url: '', description: '' });
        setShowAddEditModal(false);
        showAlert(`"${sanitizedTool.name}" 도구가 추가되었습니다.`);
      } else {
        showAlert(result.error!, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [newTool, addTool, showAlert]);

  const handleUpdateTool = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    setIsLoading(true);
    
    try {
      // Validation
      const nameValidation = validateName(editingTool.name);
      const urlValidation = validateUrl(editingTool.url);
      const descriptionValidation = validateDescription(editingTool.description || '');
      
      if (!nameValidation.isValid) {
        showAlert(nameValidation.error!, 'error');
        return;
      }
      
      if (!urlValidation.isValid) {
        showAlert(urlValidation.error!, 'error');
        return;
      }
      
      if (!descriptionValidation.isValid) {
        showAlert(descriptionValidation.error!, 'error');
        return;
      }

      // Sanitize inputs
      const sanitizedUpdates = {
        name: sanitizeInput(editingTool.name),
        url: editingTool.url.trim(),
        description: sanitizeInput(editingTool.description || '')
      };

      const result = await updateTool(editingTool.id, sanitizedUpdates);
      if (result.success) {
        setEditingTool(null);
        setShowAddEditModal(false);
        showAlert(`"${sanitizedUpdates.name}" 도구가 변경되었습니다.`);
      } else {
        showAlert(result.error!, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [editingTool, updateTool, showAlert]);

  const handleDeleteTool = useCallback(async (id: string) => {
    const toolToDelete = tools.find(tool => tool.id === id);
    if (!toolToDelete) return;
    
    setDeletingTool(toolToDelete);
    setShowDeleteModal(true);
  }, [tools]);

  const confirmDeleteTool = useCallback(async () => {
    if (!deletingTool) return;
    
    setIsLoading(true);
    try {
      const result = await deleteTool(deletingTool.id);
      if (result.success) {
        showAlert(`"${deletingTool.name}" 도구가 삭제되었습니다.`);
        setShowDeleteModal(false);
        setDeletingTool(null);
      } else {
        showAlert(result.error!, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [deletingTool, deleteTool, showAlert]);

  const handleToggleVisibility = useCallback(async (id: string, currentHidden: boolean) => {
    const result = await toggleToolVisibility(id, currentHidden);
    if (result.success) {
      const targetTool = tools.find(tool => tool.id === id);
      showAlert(`"${targetTool?.name}" 도구가 ${currentHidden ? '표시' : '숨겨짐'} 되었습니다.`);
    } else {
      showAlert(result.error!, 'error');
    }
  }, [toggleToolVisibility, tools, showAlert]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tools.findIndex(tool => tool.id === active.id);
      const newIndex = tools.findIndex(tool => tool.id === over?.id);
      
      const newTools = arrayMove(tools, oldIndex, newIndex);
      
      const result = await reorderTools(newTools);
      if (result.success) {
        showAlert('도구 순서가 성공적으로 변경되었습니다!');
      } else {
        showAlert(result.error!, 'error');
      }
    }
  }, [reorderTools, showAlert]);

  const openEditModal = useCallback((tool: Tool) => {
    setEditingTool(tool);
    setShowAddEditModal(true);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingTool(null);
    setNewTool({ name: '', url: 'https://', description: '' });
    setShowAddEditModal(true);
  }, []);

  return (
    <div className="app-container">
      <Navbar bg="dark" variant="dark" className="custom-navbar">
        <Container className="navbar-container">
          <Navbar.Brand href="#home" className="brand-container">
            <img src={gcampLogo} alt="GrowthCamp Logo" className="brand-logo" />
          </Navbar.Brand>
          
          {/* 중앙 타이틀 */}
          <div className="center-title">
            <img src={gcampNameLogo} alt="GrowthCamp" className="brand-name-logo" />
            <span className="brand-subtitle">AX Tools</span>
          </div>
          
          <div className="login-container">
            {isAdmin ? (
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="login-btn">
                로그아웃
              </Button>
            ) : (
              <Button variant="outline-light" size="sm" onClick={() => setShowLoginModal(true)} className="login-btn">
                로그인
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      <main className="main-content">
        <Container fluid className="content-container">
          {isAdmin && (
            <div className="admin-controls">
              <Button variant="primary" onClick={openAddModal} className="add-tool-btn">
                새 도구 추가
              </Button>
            </div>
          )}

          <h1 className="main-title">지금 활용가능한 도구들</h1>
          
          {visibleTools.length === 0 ? (
            <div className="empty-state">
              <p>사용 가능한 도구가 없습니다. 관리자가 도구를 추가해주세요!</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="tools-grid">
              <SkeletonCard count={6} />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleTools.map(tool => tool.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="tools-grid">
                  {visibleTools.map((tool) => (
                    <div key={tool.id} className="tool-card-wrapper">
                      <ToolCard
                        tool={tool}
                        isAdmin={isAdmin}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTool}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          
          {isReordering && (
            <div className="reordering-overlay">
              <div className="reordering-spinner">순서 변경 중...</div>
            </div>
          )}
        </Container>
      </main>

      <footer className="footer">
        <Container>
          <p className="footer-text">© Better AX begins with GrowthCamp. All rights reserved.</p>
        </Container>
      </footer>

      {/* Login Modal */}
      <AuthModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        isLoading={isLoading}
      />

      {/* Add/Edit Tool Modal */}
      <ToolModal
        show={showAddEditModal}
        onHide={() => setShowAddEditModal(false)}
        editingTool={editingTool}
        formData={editingTool ? { name: editingTool.name, url: editingTool.url, description: editingTool.description || '' } : newTool}
        onFormDataChange={(field, value) => {
          if (editingTool) {
            setEditingTool({ ...editingTool, [field]: value });
          } else {
            setNewTool({ ...newTool, [field]: value });
          }
        }}
        onSubmit={editingTool ? handleUpdateTool : handleAddTool}
        isLoading={isLoading}
      />

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setDeletingTool(null);
        }}
        onConfirm={confirmDeleteTool}
        toolName={deletingTool?.name || ''}
        isLoading={isLoading}
      />

      {/* 커스텀 알림 팝업 */}
      <CustomAlert alertState={alertState} onClose={hideAlert} />
    </div>
  );
}

export default App;
