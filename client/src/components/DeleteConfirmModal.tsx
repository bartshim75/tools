import React, { memo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  toolName: string;
  isLoading?: boolean;
}

const DeleteConfirmModal = memo<DeleteConfirmModalProps>(({
  show,
  onHide,
  onConfirm,
  toolName,
  isLoading = false
}) => {
  return (
    <Modal show={show} onHide={onHide} centered className="delete-confirm-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2 text-danger">
          <Trash2 size={20} />
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
      
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex gap-2 w-100">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={isLoading}
            className="flex-fill"
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-fill d-flex align-items-center justify-content-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">삭제 중...</span>
                </div>
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                삭제
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal; 