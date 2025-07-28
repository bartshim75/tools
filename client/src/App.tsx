import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import { Modal, Button, Form, Card, Row, Col, Navbar, Container } from 'react-bootstrap';
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Tool {
  id: string;
  name: string;
  url: string;
  description: string | null;
  order_index: number;
}

// 드래그 가능한 도구 카드 컴포넌트
function SortableToolCard({ tool, isAdmin, onEdit, onDelete }: {
  tool: Tool;
  isAdmin: boolean;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className={`tool-card ${isAdmin ? 'admin-mode' : ''} ${isDragging ? 'dragging' : ''}`}>
        <Card.Body className="tool-card-body">
          <Card.Title className="tool-title">{tool.name}</Card.Title>
          <Card.Text className="tool-description">
            {tool.description || '설명이 없습니다.'}
          </Card.Text>
          <div className="tool-actions">
            <Button
              variant="primary"
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="use-tool-btn"
            >
              사용하기
            </Button>
            {isAdmin && (
              <div className="admin-actions">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => onEdit(tool)}
                  className="edit-btn"
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(tool.id)}
                  className="delete-btn"
                >
                  삭제
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newTool, setNewTool] = useState({ name: '', url: '', description: '' });
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTools();
    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
      if (!session) {
        // 로그아웃 시 모달 닫기 및 폼 초기화
        setShowLoginModal(false);
        setShowAddEditModal(false);
        setEditingTool(null);
        setNewTool({ name: '', url: '', description: '' });
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) {
      console.error('Error fetching tools:', error);
    } else {
      setTools(data || []);
    }
  };

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      alert('Logged in as admin!');
      setEmail('');
      setPassword('');
      setShowLoginModal(false);
      checkAdminStatus();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      alert('Logged out.');
      setIsAdmin(false);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxOrderIndex = tools.length > 0 ? Math.max(...tools.map(t => t.order_index)) : -1;
    const newToolWithOrder = { ...newTool, order_index: maxOrderIndex + 1 };
    
    const { data, error } = await supabase
      .from('tools')
      .insert([newToolWithOrder])
      .select();
    if (error) {
      alert('Error adding tool: ' + error.message);
    } else {
      setTools([...tools, data[0]]);
      setNewTool({ name: '', url: '', description: '' });
      setShowAddEditModal(false);
      alert('Tool added successfully!');
    }
  };

  const handleUpdateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    const { data, error } = await supabase
      .from('tools')
      .update({ name: editingTool.name, url: editingTool.url, description: editingTool.description })
      .eq('id', editingTool.id)
      .select();
    if (error) {
      alert('Error updating tool: ' + error.message);
    } else {
      setTools(tools.map(tool => (tool.id === editingTool.id ? data[0] : tool)));
      setEditingTool(null);
      setShowAddEditModal(false);
      alert('Tool updated successfully!');
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Error deleting tool: ' + error.message);
    } else {
      setTools(tools.filter(tool => tool.id !== id));
      alert('Tool deleted successfully!');
    }
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setShowAddEditModal(true);
  };

  const openAddModal = () => {
    setEditingTool(null);
    setNewTool({ name: '', url: 'https://', description: '' }); // URL 자동입력
    setShowAddEditModal(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setIsReordering(true);
      
      const oldIndex = tools.findIndex(tool => tool.id === active.id);
      const newIndex = tools.findIndex(tool => tool.id === over?.id);
      
      const newTools = arrayMove(tools, oldIndex, newIndex);
      setTools(newTools);

      try {
        // 단일 도구씩 순차적으로 업데이트
        for (let i = 0; i < newTools.length; i++) {
          const tool = newTools[i];
          const { error } = await supabase
            .from('tools')
            .update({ order_index: i })
            .eq('id', tool.id);
          
          if (error) {
            console.error(`Error updating tool ${tool.name}:`, error);
            throw error;
          }
        }
        
        alert('도구 순서가 성공적으로 변경되었습니다!');
      } catch (error) {
        console.error('Error updating tool order:', error);
        alert('순서 변경 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
        // 오류 시 원래 순서로 복원
        fetchTools();
      }
      
      setIsReordering(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
        <Container className="navbar-container">
          <Navbar.Brand href="#home" className="brand-container">
            <img src="/gcamp_logo.svg" alt="GrowthCamp Logo" className="brand-logo" />
          </Navbar.Brand>
          
          {/* 중앙 타이틀 */}
          <div className="center-title">
            <img src="/gcamp_name_logo.svg" alt="GrowthCamp" className="brand-name-logo" />
            <span className="brand-subtitle">AX Tools</span>
          </div>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            {isAdmin ? (
              <Button variant="outline-light" size="sm" onClick={handleLogout} className="login-btn">
                로그아웃
              </Button>
            ) : (
              <Button variant="outline-light" size="sm" onClick={() => setShowLoginModal(true)} className="login-btn">
                로그인
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="main-content">
        <Container className="content-container">
          {isAdmin && (
            <div className="admin-controls">
              <Button variant="primary" onClick={openAddModal} className="add-tool-btn">
                새 도구 추가
              </Button>
            </div>
          )}

          <h1 className="main-title">지금 활용가능한 도구들</h1>
          
          {tools.length === 0 ? (
            <div className="empty-state">
              <p>사용 가능한 도구가 없습니다. 관리자가 도구를 추가해주세요!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tools.map(tool => tool.id)}
                strategy={verticalListSortingStrategy}
              >
                <Row xs={1} md={2} lg={3} className="tools-grid">
                  {tools.map((tool) => (
                    <Col key={tool.id}>
                      <SortableToolCard
                        tool={tool}
                        isAdmin={isAdmin}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTool}
                      />
                    </Col>
                  ))}
                </Row>
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
          <p className="footer-text">© AX Leading by GrowthCamp. All rights reserved.</p>
        </Container>
      </footer>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>관리자 로그인</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>이메일 주소</Form.Label>
              <Form.Control
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              로그인
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add/Edit Tool Modal */}
      <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingTool ? '도구 수정' : '새 AX도구 추가'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingTool ? handleUpdateTool : handleAddTool}>
            <Form.Group className="mb-3" controlId="toolName">
              <Form.Label>도구 이름</Form.Label>
              <Form.Control
                type="text"
                placeholder="도구 이름을 입력하세요"
                value={editingTool ? editingTool.name : newTool.name}
                onChange={(e) => editingTool ? setEditingTool({ ...editingTool, name: e.target.value }) : setNewTool({ ...newTool, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="toolUrl">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="도구 URL을 입력하세요"
                value={editingTool ? editingTool.url : newTool.url}
                onChange={(e) => editingTool ? setEditingTool({ ...editingTool, url: e.target.value }) : setNewTool({ ...newTool, url: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="toolDescription">
              <Form.Label>설명 (선택사항)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="도구 설명을 입력하세요"
                value={editingTool ? editingTool.description || '' : newTool.description}
                onChange={(e) => editingTool ? setEditingTool({ ...editingTool, description: e.target.value }) : setNewTool({ ...newTool, description: e.target.value })}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              {editingTool ? '도구 수정' : '도구 추가'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
