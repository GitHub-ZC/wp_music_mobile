// Qgroup.java

package com.wp_music;

import android.widget.Toast;

import android.content.Intent;
import android.net.Uri;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class Qgroup extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public Qgroup(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "Qgroup";
    }

    @ReactMethod
    public boolean joinQQGroup(String key) {
        Intent intent = new Intent();
        intent.setData(Uri.parse("mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26jump_from%3Dwebapi%26k%3D" + key));
    // 此Flag可根据具体产品需要自定义，如设置，则在加群界面按返回，返回手Q主界面，不设置，按返回会返回到呼起产品界面    
        // intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            getCurrentActivity().startActivity(intent);
            return true;
        } catch (Exception e) {
            // 未安装手Q或安装的版本不支持
            Toast.makeText(reactContext, "未安装QQ或版本不支持，请手动添加", Toast.LENGTH_LONG).show();
            return false;
        }
    }
}