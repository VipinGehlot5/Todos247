# Todo App - MERN Stack Task Management Application

A modern task management application built with Next.js, featuring user authentication, todo CRUD operations, and an intelligent auto-logout system with configurable inactivity timeout.

## Features

### Core Features

- **User Authentication**: Secure login and signup using JWT tokens
- **Task Management**: Create, read, update, and delete todo tasks
- **Task Filtering**: View all, active, or completed tasks
- **User Dashboard**: Personal dashboard with task statistics

### Security Features

- **Auto-Logout System**: Automatically logs out users after a configurable period of inactivity
- **Warning Countdown**: 60-second warning popup before auto-logout with options to stay logged in or logout immediately
- **Activity Tracking**: Monitors user interactions (mouse, keyboard, API calls) to reset inactivity timer
- **Stay Signed In**: Option to disable auto-logout for persistent sessions

### Bonus Features

- **Configurable Timeout**: Users can set their preferred inactivity timeout (1-60 minutes) from profile settings
- **Stay Signed In Option**: Checkbox on login to maintain session without auto-logout

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Management**: React Context API
- **API Integration**: Axios
- **Authentication**: JWT (via DummyJSON API)
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Lucide React icons, Sonner for notifications

## Prerequisites

- Node.js 18+
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd todo-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - The `.env.local` file is already configured with default values
   - You can modify these values if needed:

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
NEXT_PUBLIC_INACTIVITY_TIMEOUT=10
NEXT_PUBLIC_WARNING_COUNTDOWN=60
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

Since this application uses DummyJSON API, use these credentials to test:

- **Username**: emilys
- **Password**: emilyspass

## Project Structure

```
todo-app/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page with todo management
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── profile/          # Profile settings page
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home/landing page
├── components/            # Reusable components
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context with auto-logout logic
├── lib/                  # Utility functions and services
│   ├── auth.ts          # Authentication service
│   └── todos.ts         # Todo CRUD service
└── public/              # Static assets
```

## Key Features Implementation

### Auto-Logout Feature

- Tracks user inactivity through mouse movements, keyboard inputs, and API calls
- Configurable timeout duration (default: 10 minutes)
- Shows warning popup 60 seconds before logout
- Options to "Stay Logged In" or "Logout Now" in the warning popup
- Timer resets on any user interaction

### Session Management

- JWT tokens stored in cookies for security
- User data cached in localStorage for quick access
- Automatic token refresh mechanism
- Persistent "Stay Signed In" option

### Todo Management

- Full CRUD operations on tasks
- Real-time updates with optimistic UI
- Task completion toggling
- Inline editing of tasks
- Filter tasks by status (all/active/completed)

## API Endpoints Used

The application integrates with DummyJSON API:

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token

### Todos

- `GET /todos` - Get all todos
- `GET /todos/user/{userId}` - Get user's todos
- `POST /todos/add` - Create new todo
- `PUT /todos/{id}` - Update todo
- `DELETE /todos/{id}` - Delete todo

## Development Approach

### Architecture Decisions

1. **Next.js App Router**: Utilized for better performance and server components support
2. **Context API**: Chosen for state management due to app size and complexity
3. **TypeScript**: Ensures type safety and better developer experience
4. **Tailwind CSS**: Rapid UI development with utility-first approach

### Challenges & Solutions

1. **Challenge**: DummyJSON doesn't have real user signup

   - **Solution**: Simulated signup flow with user creation endpoint, directing to login with demo credentials

2. **Challenge**: Managing inactivity timer across components

   - **Solution**: Centralized timer logic in AuthContext with event listeners

3. **Challenge**: Preventing timer reset during countdown

   - **Solution**: Conditional activity tracking based on warning state

4. **Challenge**: Persisting user preferences
   - **Solution**: localStorage for settings, cookies for auth tokens

## Production Deployment

To build for production:

```bash
npm run build
npm start
```

For deployment, consider:

- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

## Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://dummyjson.com
NEXT_PUBLIC_INACTIVITY_TIMEOUT=10
NEXT_PUBLIC_WARNING_COUNTDOWN=60
```

## Security Considerations

- JWT tokens stored in httpOnly cookies (when using real backend)
- XSS protection through React's built-in escaping
- CSRF protection via SameSite cookie attribute
- Input validation with Zod schemas
- Secure password handling (never logged or exposed)

## Future Enhancements

- Real backend implementation with database
- Task categories and tags
- Task priority levels
- Due dates and reminders
- Collaborative task sharing
- Dark mode theme
- Mobile app version
- Email notifications
- Task search and sorting
- Bulk operations on tasks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is created for educational purposes.

## Acknowledgments

- DummyJSON for providing the mock API
- Next.js team for the amazing framework
- All open-source contributors

## Contact

For any questions or feedback, please open an issue in the GitHub repository.
