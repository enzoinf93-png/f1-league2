# F1 League - Avvio Rapido

## 1. Prerequisiti
- Node.js >= 18
- Docker Desktop (per PostgreSQL)

## 2. Copia il file .env nel backend
Copia `backend/env.example` in `backend/.env`

## 3. Avvia il database
```powershell
docker-compose up -d
```

## 4. Setup backend (prima volta)
```powershell
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

## 5. Avvia backend
```powershell
cd backend
npm run dev
```

## 6. Avvia frontend (in un secondo terminale)
```powershell
cd frontend
npm run dev
```

## 7. Accesso
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Credenziali admin default
- Email: admin@f1league.com
- Password: admin123

## Flusso di utilizzo
1. Accedi come admin → crea una lega → copia il link invito
2. Condividi il link con gli amici
3. Gli amici si registrano e si iscrivono tramite link
4. Tutti inseriscono le previsioni prima delle qualifiche
5. Dopo la gara, l'admin inserisce i risultati
6. I punteggi vengono calcolati automaticamente
