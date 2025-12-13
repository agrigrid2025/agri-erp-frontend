const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Get CSRF token from cookie
    let csrfToken = getCookie('csrftoken');

    // If no cookie yet, force a GET to set it
    if (!csrfToken) {
      const getResp = await fetch(`https://${tenant}.agrigrid.net/login/`, {
        credentials: 'include',
      });
      csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        setError('Failed to get CSRF token');
        setLoading(false);
        return;
      }
    }

    console.log('CSRF Token:', csrfToken); // For debugging — check browser console

    const response = await fetch(`https://${tenant}.agrigrid.net/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken,
      },
      body: new URLSearchParams({
        'username': username,
        'password': password,
        'csrfmiddlewaretoken': csrfToken,
      }),
      credentials: 'include',
      redirect: 'follow',  // Important: follow redirects
    });

    console.log('Login response status:', response.status);
    console.log('Login response URL:', response.url);

    // Django login success usually redirects (302 → 200 on final page)
    if (response.ok || response.redirected || response.url.includes('/dashboard/') || response.url.includes('/home/')) {
      // Success!
      navigate(`/dashboard/${tenant}`);
    } else {
      // Check response text for clues
      const text = await response.text();
      console.log('Login failed response:', text.substring(0, 500));
      setError('Invalid username or password');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Network error — check farm code or server');
  } finally {
    setLoading(false);
  }
};

export default ComponentName;
export default LoginPage;