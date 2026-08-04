import { initializeApp, getApps, cert } from 'firebase-admin/app'

let adminApp: any = null

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }

  if (getApps().length === 0) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      adminApp = initializeApp({
        credential: cert(serviceAccount as any)
      })
    } else {
      console.error('Missing Firebase Admin credentials')
    }
  } else {
    adminApp = getApps()[0]
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error)
}

export { adminApp }
