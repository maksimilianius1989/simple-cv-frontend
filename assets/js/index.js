const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get("token");
if (tokenFromUrl) {
    localStorage.setItem(ACCESS_TOKEN, tokenFromUrl);
    window.history.replaceState(
    {},
    document.title,
    window.location.pathname,
    );
    window.location.href = "/dashboard.html";
}