import React, { memo, useCallback } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { validateEmail, validatePassword } from '../utils/validation';

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

const AuthModal = memo<AuthModalProps>(({
  show,
  onHide,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  isLoading = false
}) => {
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
  }, [onEmailChange]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onPasswordChange(e.target.value);
  }, [onPasswordChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>관리자 로그인</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>이메일 주소</Form.Label>
            <Form.Control
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={handleEmailChange}
              required
              disabled={isLoading}
              aria-describedby="emailHelp"
            />
            <Form.Text id="emailHelp" className="text-muted">
              관리자 계정의 이메일을 입력해주세요.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>비밀번호</Form.Label>
            <Form.Control
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={handlePasswordChange}
              required
              disabled={isLoading}
              aria-describedby="passwordHelp"
            />
            <Form.Text id="passwordHelp" className="text-muted">
              관리자 계정의 비밀번호를 입력해주세요.
            </Form.Text>
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            className="w-100"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
});

AuthModal.displayName = 'AuthModal';

export default AuthModal; 