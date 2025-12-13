const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Get CSRF token from cookie (Django sets it on any GET)
    const csrfToken = getCookie('csrftoken');

    if (!csrfToken) {
      setError('CSRF token missing. Try refreshing.');
      setLoading(false);
      return;
    }

    const response = await fetch(`https://${tenant}.agrigrid.net/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken,
      },
      body: new URLSearchParams({
        username,
        password,
        csrfmiddlewaretoken: csrfToken,
      }),
      credentials: 'include',
    });

    if (response.ok || response.status === 302) {
      navigate(`/dashboard/${tenant}`);
    } else {
      setError('Invalid username or password');
    }
  } catch (err) {
    setError('Login failed. Check connection or farm code.');
  } finally {
    setLoading(false);
  }
};

// Helper to read cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};