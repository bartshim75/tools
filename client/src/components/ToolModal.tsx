import React, { memo, useCallback } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import type { Tool, NewTool } from '../types/index.js';
import { validateName, validateUrl, validateDescription } from '../utils/validation';

interface ToolModalProps {
  show: boolean;
  onHide: () => void;
  editingTool: Tool | null;
  formData: NewTool;
  onFormDataChange: (field: keyof NewTool, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

const ToolModal = memo<ToolModalProps>(({
  show,
  onHide,
  editingTool,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false
}) => {
  const handleInputChange = useCallback((field: keyof NewTool) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onFormDataChange(field, e.target.value);
  }, [onFormDataChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  }, [onSubmit]);

  const isEditing = !!editingTool;
  const title = isEditing ? '도구 수정' : '새 AX도구 추가';
  const submitText = isEditing ? '도구 수정' : '도구 추가';

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="toolName">
            <Form.Label>도구 이름 *</Form.Label>
            <Form.Control
              type="text"
              placeholder="도구 이름을 입력하세요"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              disabled={isLoading}
              aria-describedby="nameHelp"
              maxLength={100}
            />
            <Form.Text id="nameHelp" className="text-muted">
              도구의 이름을 입력해주세요. (최대 100자)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="toolUrl">
            <Form.Label>URL *</Form.Label>
            <Form.Control
              type="url"
              placeholder="도구 URL을 입력하세요"
              value={formData.url}
              onChange={handleInputChange('url')}
              required
              disabled={isLoading}
              aria-describedby="urlHelp"
            />
            <Form.Text id="urlHelp" className="text-muted">
              도구의 웹사이트 주소를 입력해주세요. (http:// 또는 https:// 포함)
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="toolDescription">
            <Form.Label>설명 (선택사항)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="도구 설명을 입력하세요"
              value={formData.description}
              onChange={handleInputChange('description')}
              disabled={isLoading}
              aria-describedby="descriptionHelp"
              maxLength={500}
            />
            <Form.Text id="descriptionHelp" className="text-muted">
              도구에 대한 간단한 설명을 입력해주세요. (최대 500자)
            </Form.Text>
          </Form.Group>

          <Button 
            variant="success" 
            type="submit" 
            className="w-100"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : submitText}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
});

ToolModal.displayName = 'ToolModal';

export default ToolModal; 