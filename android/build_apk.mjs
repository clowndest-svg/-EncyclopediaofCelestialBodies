import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANDR = path.join(ROOT, 'android');
const OUT = path.join(ROOT, 'dist_apk');
const WORK = path.join(ANDR, '_build');

const JAVA_HOME = process.env.JAVA_HOME || 'E:\\BianChengGongJu\\GeoServer\\OpenJDK17U';
const SDK = process.env.ANDROID_HOME || 'D:\\Android\\Sdk';
const BT = path.join(SDK, 'build-tools', '35.0.0');
const ANDROID_JAR = path.join(SDK, 'platforms', 'android-35', 'android.jar');

const JAVAC = path.join(JAVA_HOME, 'bin', 'javac.exe');
const KEYTOOL = path.join(JAVA_HOME, 'bin', 'keytool.exe');
const AAPT2 = path.join(BT, 'aapt2.exe');
const D8 = path.join(BT, 'd8.bat');
const ZIPALIGN = path.join(BT, 'zipalign.exe');
const APKSIGNER = path.join(BT, 'apksigner.bat');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

console.log('1. Preparing Android APK workspace...');
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(path.join(WORK, 'res', 'mipmap-xxxhdpi'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'res', 'mipmap-xxhdpi'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'res', 'mipmap-xhdpi'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'assets', 'models'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'classes'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'dex'), { recursive: true });
fs.mkdirSync(path.join(WORK, 'gen'), { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

console.log('2. Generating Android launcher icons from desktop/cosmos.ico...');
const pyIcon = `
from PIL import Image
img = Image.open(r'${path.join(ROOT, 'desktop', 'cosmos.ico')}').convert('RGBA')
[img.resize((sz, sz), Image.LANCZOS).save(rf'${WORK}\\res\\{folder}\\ic_launcher.png') for folder, sz in [('mipmap-xxxhdpi', 192), ('mipmap-xxhdpi', 144), ('mipmap-xhdpi', 96)]]
`;
run(`python -c "${pyIcon.trim().replace(/\n/g, '; ')}"`);

console.log('3. Copying offline web bundle, 25,262 catalog JS & 3D GLB models into assets/...');
fs.copyFileSync(path.join(ROOT, 'cosmic_atlas_3_0.html'), path.join(WORK, 'assets', 'cosmic_atlas_3_0.html'));
fs.copyFileSync(path.join(ROOT, 'encyclopedia-catalog.js'), path.join(WORK, 'assets', 'encyclopedia-catalog.js'));
for (const f of fs.readdirSync(path.join(ROOT, 'models'))) {
  if (f.endsWith('.glb')) {
    fs.copyFileSync(path.join(ROOT, 'models', f), path.join(WORK, 'assets', 'models', f));
  }
}

console.log('4. Compiling resources with aapt2...');
const resZip = path.join(WORK, 'res.zip');
const unalignedApk = path.join(WORK, 'app-unaligned.apk');
const alignedApk = path.join(WORK, 'app-aligned.apk');
const finalApk = path.join(OUT, '万象寰宇-宇宙沙盘2-手机版.apk');

run(`"${AAPT2}" compile --dir "${path.join(WORK, 'res')}" -o "${resZip}"`);
run(`"${AAPT2}" link -o "${unalignedApk}" -I "${ANDROID_JAR}" --manifest "${path.join(ANDR, 'AndroidManifest.xml')}" -A "${path.join(WORK, 'assets')}" --java "${path.join(WORK, 'gen')}" "${resZip}"`);

console.log('5. Compiling Java & generating classes.dex...');
const javaSrc = path.join(ANDR, 'src', 'com', 'cosmicatlas', 'sandbox2', 'MainActivity.java');
const rJava = path.join(WORK, 'gen', 'com', 'cosmicatlas', 'sandbox2', 'R.java');
run(`"${JAVAC}" --release 11 -classpath "${ANDROID_JAR}" -d "${path.join(WORK, 'classes')}" "${rJava}" "${javaSrc}"`);

const classFiles = [];
function collectClasses(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectClasses(full);
    else if (ent.name.endsWith('.class')) classFiles.push(`"${full}"`);
  }
}
collectClasses(path.join(WORK, 'classes'));
run(`"${D8}" --min-api 24 --lib "${ANDROID_JAR}" --output "${path.join(WORK, 'dex')}" ${classFiles.join(' ')}`);

console.log('6. Adding classes.dex to APK, aligning & signing...');
const dexPyPath = path.join(WORK, 'add_dex.py');
fs.writeFileSync(dexPyPath, `import zipfile, shutil
src = r'${unalignedApk}'
tmp = r'${unalignedApk}.tmp'
with zipfile.ZipFile(src, 'r') as zin, zipfile.ZipFile(tmp, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        if item.filename != 'classes.dex':
            zout.writestr(item, zin.read(item.filename))
    zout.write(r'${path.join(WORK, 'dex', 'classes.dex')}', 'classes.dex')
shutil.move(tmp, src)
`, 'utf8');
run(`python "${dexPyPath}"`);

run(`"${ZIPALIGN}" -f -p 4 "${unalignedApk}" "${alignedApk}"`);

const keystore = path.join(ANDR, 'cosmic-release.jks');
if (!fs.existsSync(keystore)) {
  run(`"${KEYTOOL}" -genkeypair -v -keystore "${keystore}" -alias cosmic -keyalg RSA -keysize 2048 -validity 10000 -storepass cosmic123 -keypass cosmic123 -dname "CN=CosmicAtlas,O=CosmicStudio,C=CN"`);
}
run(`"${APKSIGNER}" sign --ks "${keystore}" --ks-key-alias cosmic --ks-pass pass:cosmic123 --key-pass pass:cosmic123 --out "${finalApk}" "${alignedApk}"`);
run(`"${APKSIGNER}" verify --print-certs "${finalApk}"`);

fs.rmSync(WORK, { recursive: true, force: true });
const mb = (fs.statSync(finalApk).size / (1024 * 1024)).toFixed(2);
console.log(`7. Android APK ready: ${finalApk} (${mb} MB)`);
