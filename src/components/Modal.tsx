import { useCallback, useState } from "react";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ModalConfig {
  title: string;
  message: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useModal() {
  const [visible, setVisible] = useState(false);

  const [config, setConfig] = useState<ModalConfig>({
    title: "",
    message: "",
  });

  const showModal = useCallback(
    ({ title, message, showCancel, onConfirm, onCancel }: ModalConfig) => {
      setConfig({
        title,
        message,
        showCancel: showCancel ?? false,
        onConfirm,
        onCancel,
      });

      setVisible(true);
    },
    [],
  );

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = useCallback(() => {
    hideModal();
    config.onConfirm?.();
  }, [config.onConfirm, hideModal]);

  const handleCancel = useCallback(() => {
    hideModal();
    config.onCancel?.();
  }, [config.onCancel, hideModal]);

  const modalProps: AlertModalProps = {
    visible,
    title: config.title,
    message: config.message,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    showCancel: config.showCancel ?? false,
  };

  return {
    showModal,
    hideModal,
    modalProps,
  };
}

export function AlertModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  showCancel = false,
}: AlertModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "12px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            marginBottom: "24px",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {showCancel && (
            <button type="button" onClick={onCancel}>
              Cancelar
            </button>
          )}

          <button type="button" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
