import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../lib/api-client';
import { setToken, setUser } from '../lib/auth-storage';
import { TextInput } from '../components/text-input';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

// Maps the backend's { error: { code, message } } envelope to a user-facing
// banner message for the register-specific cases.
const mapRegisterError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.error?.code;
    const message = error.response?.data?.error?.message;
    if (code === 'EMAIL_ALREADY_EXISTS') {
      return 'Email already registered';
    }
    if (code === 'VALIDATION_ERROR' && message) {
      return message;
    }
    if (message) {
      return message;
    }
  }
  return 'Unable to register. Please try again.';
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.name = 'Name is required';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    // Client-side validation gate: never call the API if it fails.
    if (!validate()) {
      return;
    }

    setPending(true);
    try {
      const response = await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      // Success envelope is { data: { token, user } }, so axios gives us the
      // token at response.data.data.token.
      setToken(response.data.data.token);
      setUser(response.data.data.user);
      navigate('/dashboard');
    } catch (error) {
      setFormError(mapRegisterError(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg p-6 space-y-4">
      <h1 className="text-3xl text-gray-900 font-semibold">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextInput
          label="Name"
          value={name}
          onChange={setName}
          error={fieldErrors.name}
          autoComplete="name"
        />
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldErrors.email}
          autoComplete="email"
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
          autoComplete="new-password"
        />

        {formError ? (
          <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">{formError}</div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="text-gray-600 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700">
          Log in
        </Link>
      </p>
    </div>
  );
};
