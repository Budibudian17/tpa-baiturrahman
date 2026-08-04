'use client'

import { useEffect } from 'react'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'warning',
  onConfirm,
  onCancel,
  confirmText = 'Ya',
  cancelText = 'Batal'
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          confirmBtn: 'bg-red-500 hover:bg-red-600',
          border: 'border-red-200'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
          confirmBtn: 'bg-yellow-500 hover:bg-yellow-600',
          border: 'border-yellow-200'
        }
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          confirmBtn: 'bg-green-500 hover:bg-green-600',
          border: 'border-green-200'
        }
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-blue-500" />,
          confirmBtn: 'bg-blue-500 hover:bg-blue-600',
          border: 'border-blue-200'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {styles.icon}
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 ${styles.confirmBtn} text-white rounded-lg font-semibold transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
