const getURL = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/';
  }
  // This is the production URL
  return 'https://chandan-pullanikatt.github.io/DearDiary/';
};

export default getURL; 