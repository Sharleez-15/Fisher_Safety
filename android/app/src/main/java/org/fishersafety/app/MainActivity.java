package org.fishersafety.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebResourceResponse;
import android.net.Uri;
import android.content.Intent;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.widget.Button;
import android.view.View;
import android.location.LocationManager;
import android.content.Context;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

/**
 * Secure HTTPS shell for the hosted Fisher Safety application.
 * Weather credentials stay on the Node backend, never in this Android app.
 */
public final class MainActivity extends Activity {
    private static final int LOCATION_REQUEST = 44;
    private WebView webView;
    private String pendingOrigin;
    private GeolocationPermissions.Callback pendingGeoCallback;
    private final String origin = BuildConfig.FISHER_BASE_URL;

    private boolean validUrl(String url) {
        try {
            Uri uri = Uri.parse(url);
            return "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null
                    && !uri.getHost().isEmpty() && uri.getUserInfo() == null;
        } catch (Exception e) { return false; }
    }

    private boolean sameHost(Uri uri) {
        Uri allowed = Uri.parse(origin);
        return "https".equalsIgnoreCase(uri.getScheme())
                && allowed.getHost() != null
                && allowed.getHost().equalsIgnoreCase(uri.getHost())
                && allowed.getPort() == uri.getPort();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!validUrl(origin) || "example.invalid".equalsIgnoreCase(Uri.parse(origin).getHost())) {
            showMessage("Fisher Safety server is not configured.\n\nSet fisherBaseUrl to your hosted HTTPS app URL in Android Studio (see android/README.md).");
            return;
        }
        webView = new WebView(this);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (sameHost(uri)) return false;
                if ("https".equalsIgnoreCase(uri.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                }
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOffline();
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame() && response.getStatusCode() >= 500) showOffline();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String requestOrigin, GeolocationPermissions.Callback callback) {
                if (!validUrl(requestOrigin) || !sameHost(Uri.parse(requestOrigin))) {
                    callback.invoke(requestOrigin, false, false);
                    return;
                }
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED ||
                    ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(requestOrigin, true, false);
                } else {
                    pendingOrigin = requestOrigin;
                    pendingGeoCallback = callback;
                    ActivityCompat.requestPermissions(MainActivity.this,
                      new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                      LOCATION_REQUEST);
                }
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                // Do not grant microphone/camera automatically. Add explicit UI and consent before enabling.
                request.deny();
            }
        });
        webView.loadUrl(origin);
    }

    private void showMessage(String message) {
        TextView label = new TextView(this);
        label.setText(message);
        label.setTextSize(18);
        label.setPadding(36, 72, 36, 36);
        setContentView(label);
    }

    private void showOffline() {
        if (isFinishing()) return;
        runOnUiThread(() -> {
            LinearLayout layout = new LinearLayout(this);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(32, 72, 32, 32);
            TextView message = new TextView(this);
            message.setText("Fisher Safety could not reach the server.\nLive weather is unavailable. Do not rely on saved conditions to make sea-safety decisions.");
            message.setTextSize(18);
            Button retry = new Button(this);
            retry.setText("Retry connection");
            retry.setOnClickListener(v -> {
                setContentView(webView);
                webView.loadUrl(origin);
            });
            layout.addView(message);
            layout.addView(retry);
            setContentView(layout);
        });
    }

    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if (code == LOCATION_REQUEST && pendingGeoCallback != null) {
            boolean allowed = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                    == PackageManager.PERMISSION_GRANTED ||
                    ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
                    == PackageManager.PERMISSION_GRANTED;
            pendingGeoCallback.invoke(pendingOrigin, allowed, false);
            pendingGeoCallback = null;
            pendingOrigin = null;
        }
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
