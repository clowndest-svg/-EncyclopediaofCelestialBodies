package com.cosmicatlas.sandbox2;

import android.app.Activity;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String BASE_URL = "https://cosmic.app/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        w.setStatusBarColor(Color.parseColor("#030711"));
        w.setNavigationBarColor(Color.parseColor("#030711"));
        applyImmersiveMode();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#030711"));
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            s.setSafeBrowsingEnabled(false);
        }

        final AssetManager assets = getAssets();
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri != null && "cosmic.app".equalsIgnoreCase(uri.getHost())) {
                    String path = uri.getPath();
                    if (path == null || path.equals("/") || path.isEmpty()) {
                        path = "/cosmic_atlas_3_0.html";
                    }
                    if (path.startsWith("/api/")) {
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        return new WebResourceResponse(
                            "application/json",
                            "utf-8",
                            404,
                            "Not Found",
                            headers,
                            new ByteArrayInputStream("{\"offline\":true}".getBytes(StandardCharsets.UTF_8))
                        );
                    }
                    String assetPath = path.startsWith("/") ? path.substring(1) : path;
                    try {
                        InputStream is = assets.open(assetPath);
                        String mime = guessMime(assetPath);
                        String enc = mime.startsWith("text/") || mime.contains("javascript") ? "utf-8" : null;
                        Map<String, String> headers = new HashMap<>();
                        headers.put("Access-Control-Allow-Origin", "*");
                        return new WebResourceResponse(mime, enc, 200, "OK", headers, is);
                    } catch (Exception ignored) {
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                return true;
            }
        });

        setContentView(webView);
        webView.loadUrl(BASE_URL + "cosmic_atlas_3_0.html");
    }

    private String guessMime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js") || path.endsWith(".mjs")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".glb")) return "model/gltf-binary";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private void applyImmersiveMode() {
        View decor = getWindow().getDecorView();
        decor.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applyImmersiveMode();
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "(function(){var qb=document.getElementById('book-quiz-modal');if(qb&&!qb.hidden){qb.hidden=true;return '1';}" +
                "var cb=document.getElementById('cosmic-book');if(cb&&cb.open){document.getElementById('book-close')?.click();return '1';}" +
                "var sb=document.getElementById('sandbox-modal');if(sb&&sb.open){document.getElementById('sb-exit-btn')?.click();return '1';}" +
                "return '0';})()",
                value -> {
                    if (!"\"1\"".equals(value)) {
                        finish();
                    }
                }
            );
            return;
        }
        super.onBackPressed();
    }
}
