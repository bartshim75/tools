import React, { memo } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Tool } from '../types/index.js';

interface ToolCardProps {
  tool: Tool;
  isAdmin: boolean;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentHidden: boolean) => void;
}

const ToolCard = memo<ToolCardProps>(({ 
  tool, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onToggleVisibility 
}) => {
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

  const handleEdit = () => {
    console.log('Edit button clicked for tool:', tool.name);
    onEdit(tool);
  };

  const handleDelete = () => {
    console.log('Delete button clicked for tool:', tool.name);
    onDelete(tool.id);
  };

  const handleToggleVisibility = () => {
    console.log('Toggle visibility button clicked for tool:', tool.name);
    onToggleVisibility(tool.id, tool.is_hidden);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
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
                  variant={tool.is_hidden ? "success" : "secondary"}
                  size="sm"
                  onClick={handleToggleVisibility}
                  className="visibility-btn"
                >
                  {tool.is_hidden ? "보이기" : "숨기기"}
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleEdit}
                  className="edit-btn"
                >
                  수정
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  className="delete-btn"
                >
                  삭제
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
        {/* 드래그 핸들러를 카드 상단에 별도로 배치 */}
        <div className="drag-handle" {...listeners}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="4" r="1.5"/>
            <circle cx="8" cy="4" r="1.5"/>
            <circle cx="12" cy="4" r="1.5"/>
            <circle cx="4" cy="8" r="1.5"/>
            <circle cx="8" cy="8" r="1.5"/>
            <circle cx="12" cy="8" r="1.5"/>
            <circle cx="4" cy="12" r="1.5"/>
            <circle cx="8" cy="12" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
          </svg>
        </div>
      </Card>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';

export default ToolCard; 