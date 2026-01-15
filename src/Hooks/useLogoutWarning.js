import { useState } from 'react';

export function useLogoutWarning(onConfirm) {
  const [open, setOpen] = useState(false);

  function requestLogout() {
    setOpen(true);
  }

  function cancelLogout() {
    setOpen(false);
  }

  function confirmLogout() {
    setOpen(false);
    onConfirm();
  }

  return {
    open,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
