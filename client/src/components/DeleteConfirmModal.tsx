import { Modal, Button } from 'react-bootstrap';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  toolName: string;
  isLoading: boolean;
}

export const DeleteConfirmModal = ({
  show,
  onHide,
  onConfirm,
  toolName,
  isLoading
}: DeleteConfirmModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered className="delete-confirm-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <Trash2 size={20} className="text-danger me-2" />
          도구 삭제
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        <div className="text-center">
          <div className="mb-3 mt-4">
            <AlertTriangle size={48} className="text-warning mb-3" />
            <h5 className="text-dark mb-2">정말로 이 도구를 삭제하시겠습니까?</h5>
            <p className="text-muted mb-0">
              <strong className="text-primary">{toolName}</strong> 도구가 영구적으로 삭제됩니다.
            </p>
            <p className="text-muted small mt-2">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          취소
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm} 
          disabled={isLoading}
          className="d-flex align-items-center gap-2"
        >
          <Trash2 size={16} />
          {isLoading ? '삭제 중...' : '삭제'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 