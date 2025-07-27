import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import { Modal, Button, Form, Card, Row, Col, Navbar, Container } from 'react-bootstrap';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Tool {
  id: string;
  name: string;
  url: string;
  description: string | null;
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
      .order('name', { ascending: true });
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
    const { data, error } = await supabase
      .from('tools')
      .insert([newTool])
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
    setNewTool({ name: '', url: '', description: '' });
    setShowAddEditModal(true);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container style={{ maxWidth: '1280px' }}>
          <Navbar.Brand href="#home">Growthcamp AX Tools</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            {isAdmin ? (
              <Button variant="outline-light" onClick={handleLogout}>Admin Logout</Button>
            ) : (
              <Button variant="outline-light" onClick={() => setShowLoginModal(true)}>Admin Login</Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container style={{ maxWidth: '1280px' }} className="pb-5">
        {isAdmin && (
          <div className="d-flex justify-content-end mb-4">
            <Button variant="primary" onClick={openAddModal}>Add New Tool</Button>
          </div>
        )}

        <h2 className="mb-4 text-center">Available Tools</h2>
        {tools.length === 0 ? (
          <p className="text-center">No tools available. Please add some!</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {tools.map((tool) => (
              <Col key={tool.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-primary">{tool.name}</Card.Title>
                    <Card.Text className="flex-grow-1 text-muted">{tool.description || 'No description provided.'}</Card.Text>
                    <div className="mt-auto">
                      <Button
                        variant="info"
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-100 mb-2"
                      >
                        Go to Tool
                      </Button>
                      {isAdmin && (
                        <div className="d-flex justify-content-between">
                          <Button
                            variant="warning"
                            className="w-50 me-1"
                            onClick={() => openEditModal(tool)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            className="w-50 ms-1"
                            onClick={() => handleDeleteTool(tool.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Admin Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add/Edit Tool Modal */}
      <Modal show={showAddEditModal} onHide={() => setShowAddEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingTool ? 'Edit Tool' : 'Add New Tool'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingTool ? handleUpdateTool : handleAddTool}>
            <Form.Group className="mb-3" controlId="toolName">
              <Form.Label>Tool Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tool name"
                value={editingTool ? editingTool.name : newTool.name}
                onChange={(e) => editingTool ? setEditingTool({ ...editingTool, name: e.target.value }) : setNewTool({ ...newTool, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="toolUrl">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter tool URL"
                value={editingTool ? editingTool.url : newTool.url}
                onChange={(e) => editingTool ? setEditingTool({ ...editingTool, url: e.target.value }) : setNewTool({ ...newTool, url: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="toolDescription">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={editingTool ? editingTool.description || '' : newTool.description}
                onChange={(e) => editingTool ? setEditingTool({ ...editingTool, description: e.target.value }) : setNewTool({ ...newTool, description: e.target.value })}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              {editingTool ? 'Update Tool' : 'Add Tool'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default App;
