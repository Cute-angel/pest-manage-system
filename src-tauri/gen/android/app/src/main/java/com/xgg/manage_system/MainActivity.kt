package com.xgg.manage_system

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import app.tauri.notification.ACTION_INTENT_KEY
import app.tauri.notification.NOTIFICATION_INTENT_KEY
import app.tauri.notification.NOTIFICATION_OBJ_INTENT_KEY
import org.json.JSONObject

private const val NOTIFICATION_BRIDGE_PREFS = "manage-system-notification-bridge"
private const val PENDING_NOTIFICATION_ACTION_KEY = "pending-notification-action"
private const val NOTIFICATION_ACTION_EVENT = "manage-system-notification-action"
private const val NOTIFICATION_TAG = "ManageSystemNotification"

private class NotificationActionBridge(
  private val consumePendingNotificationActionFn: () -> String?
) {
  @JavascriptInterface
  fun consumePendingNotificationAction(): String? = consumePendingNotificationActionFn()
}

class MainActivity : TauriActivity() {
  private var appWebView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    cacheNotificationIntent(intent)
    super.onCreate(savedInstanceState)
  }

  override fun onNewIntent(intent: Intent) {
    cacheNotificationIntent(intent)
    super.onNewIntent(intent)
    setIntent(intent)
    dispatchPendingNotificationAction()
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    appWebView = webView
    webView.addJavascriptInterface(
      NotificationActionBridge(::consumePendingNotificationAction),
      "ManageSystemNotifications"
    )
    dispatchPendingNotificationAction()
  }

  private fun cacheNotificationIntent(intent: Intent?) {
    if (intent == null) {
      Log.d(NOTIFICATION_TAG, "cacheNotificationIntent skipped: intent is null")
      return
    }

    val notificationId = intent.getIntExtra(NOTIFICATION_INTENT_KEY, Int.MIN_VALUE)

    if (notificationId == Int.MIN_VALUE) {
      Log.d(NOTIFICATION_TAG, "cacheNotificationIntent skipped: no notification id")
      return
    }

    val payload = JSONObject()
    payload.put("actionId", intent.getStringExtra(ACTION_INTENT_KEY))

    val notificationJson = intent.getStringExtra(NOTIFICATION_OBJ_INTENT_KEY)
    val notification = if (notificationJson.isNullOrBlank()) {
      JSONObject()
    } else {
      runCatching { JSONObject(notificationJson) }.getOrElse { JSONObject() }
    }

    if (!notification.has("id")) {
      notification.put("id", notificationId)
    }

    payload.put("notification", notification)

    getSharedPreferences(NOTIFICATION_BRIDGE_PREFS, MODE_PRIVATE)
      .edit()
      .putString(PENDING_NOTIFICATION_ACTION_KEY, payload.toString())
      .apply()

    Log.i(NOTIFICATION_TAG, "cached notification payload: $payload")
  }

  private fun consumePendingNotificationAction(): String? {
    val preferences = getSharedPreferences(NOTIFICATION_BRIDGE_PREFS, MODE_PRIVATE)
    val payload = preferences.getString(PENDING_NOTIFICATION_ACTION_KEY, null) ?: return null

    preferences.edit().remove(PENDING_NOTIFICATION_ACTION_KEY).apply()
    Log.i(NOTIFICATION_TAG, "consumed pending notification payload: $payload")
    return payload
  }

  private fun dispatchPendingNotificationAction() {
    val webView = appWebView ?: return
    val payload = getSharedPreferences(NOTIFICATION_BRIDGE_PREFS, MODE_PRIVATE)
      .getString(PENDING_NOTIFICATION_ACTION_KEY, null)
      ?: return
    val escapedPayload = JSONObject.quote(payload)

    Log.i(NOTIFICATION_TAG, "dispatching pending notification payload to webview: $payload")

    webView.post {
      webView.evaluateJavascript(
        """
        (() => {
          const payload = $escapedPayload;
          window.dispatchEvent(
            new CustomEvent('$NOTIFICATION_ACTION_EVENT', { detail: payload })
          );
        })();
        """.trimIndent(),
        null
      )
    }
  }
}
