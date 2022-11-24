import {useState} from 'react';
import {useNavigate, Link} from '@shopify/hydrogen/client';
import {getInputStyleClasses} from '~/lib/styleUtils';
import formstyles from '../AccountForms.module.scss';
import styles from './AccLogin.module.scss';

interface FormElements {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

export function AccountLoginForm({shopName}: {shopName: string}) {
  const navigate = useNavigate();

  const [hasSubmitError, setHasSubmitError] = useState(false);
  const [showEmailField, setShowEmailField] = useState(true);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<null | string>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<null | string>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement & FormElements>) {
    event.preventDefault();

    setEmailError(null);
    setHasSubmitError(false);
    setPasswordError(null);

    if (showEmailField) {
      checkEmail(event);
    } else {
      checkPassword(event);
    }
  }

  function checkEmail(event: React.FormEvent<HTMLFormElement & FormElements>) {
    if (event.currentTarget.email.validity.valid) {
      setShowEmailField(false);
    } else {
      setEmailError('Please enter a valid email');
    }
  }

  async function checkPassword(
    event: React.FormEvent<HTMLFormElement & FormElements>,
  ) {
    const validity = event.currentTarget.password.validity;
    if (validity.valid) {
      const response = await callLoginApi({
        email,
        password,
      });

      if (response.error) {
        setHasSubmitError(true);
        resetForm();
      } else {
        navigate('/account');
      }
    } else {
      setPasswordError(
        validity.valueMissing
          ? 'Please enter a password'
          : 'Passwords must be at least 6 characters',
      );
    }
  }

  function resetForm() {
    setShowEmailField(true);
    setEmail('');
    setEmailError(null);
    setPassword('');
    setPasswordError(null);
  }

  return (
    <div className={formstyles.AFWrapper}>
      <div className={formstyles.AFCard}>
        <h1 className={formstyles.AFCard__heading}>Sign in</h1>
        <form noValidate className={formstyles.AF} onSubmit={onSubmit}>
          {hasSubmitError && (
            <div className={formstyles.AFSubmitErr}>
              <p>
                Sorry we did not recognize either your email or password. Please
                try to sign in again or create a new account.
              </p>
            </div>
          )}
          {showEmailField && (
            <EmailField
              shopName={shopName}
              email={email}
              setEmail={setEmail}
              emailError={emailError}
            />
          )}
          {!showEmailField && (
            <ValidEmail email={email} resetForm={resetForm} />
          )}
          {!showEmailField && (
            <PasswordField
              password={password}
              setPassword={setPassword}
              passwordError={passwordError}
            />
          )}
        </form>
      </div>
    </div>
  );
}

export async function callLoginApi({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const res = await fetch(`/account/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });
    if (res.ok) {
      return {};
    } else {
      return res.json();
    }
  } catch (error: any) {
    return {
      error: error.toString(),
    };
  }
}

function EmailField({
  email,
  setEmail,
  emailError,
  shopName,
}: {
  email: string;
  setEmail: (email: string) => void;
  emailError: null | string;
  shopName: string;
}) {
  return (
    <>
      <div className={formstyles.Field}>
        <input
          className={`${formstyles.Input} ${
            emailError ? formstyles.Input__err : ''
          }`}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          aria-label="Email address"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        {!emailError ? (
          ''
        ) : (
          <p className={formstyles.Field__err}>{emailError} &nbsp;</p>
        )}
      </div>
      <div className={formstyles.SubmitBox}>
        <button className={formstyles.SubmitBtn} type="submit">
          Next
        </button>
      </div>
      <div className={formstyles.AddInfo}>
        <p>
          New to {shopName}? &nbsp;
          <Link to="/account/register">Create an account</Link>
        </p>
      </div>
    </>
  );
}

function ValidEmail({
  email,
  resetForm,
}: {
  email: string;
  resetForm: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p>{email}</p>
        <input
          className="hidden"
          type="text"
          autoComplete="username"
          value={email}
          readOnly
        ></input>
      </div>
      <div>
        <button
          className="inline-block align-baseline text-sm underline"
          type="button"
          onClick={resetForm}
        >
          Change email
        </button>
      </div>
    </div>
  );
}

function PasswordField({
  password,
  setPassword,
  passwordError,
}: {
  password: string;
  setPassword: (password: string) => void;
  passwordError: null | string;
}) {
  return (
    <>
      <div className={formstyles.Field}>
        <input
          className={`${formstyles.Input} ${
            passwordError ? formstyles.Input__err : ''
          }`}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          minLength={8}
          required
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        {!passwordError ? (
          ''
        ) : (
          <p className={`text-red-500 text-xs`}> {passwordError} &nbsp;</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-primary text-contrast rounded py-2 px-4 focus:shadow-outline block w-full"
          type="submit"
        >
          Sign in
        </button>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex-1"></div>
        <Link
          className="inline-block align-baseline text-sm text-primary/50"
          to="/account/recover"
        >
          Forgot password
        </Link>
      </div>
    </>
  );
}
