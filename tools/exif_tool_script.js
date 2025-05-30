document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const exifInfoOutput = document.getElementById('exifInfoOutput');
    const saveButton = document.getElementById('saveButton');
    const resetButton = document.getElementById('resetButton');

    let originalImage = null; // 元の画像データを保持

    // Helper function to format ExposureTime
    function formatExposureTime(exposureTime) {
        if (!exposureTime) return "";
        if (exposureTime.numerator && exposureTime.denominator) {
            if (exposureTime.numerator === 1) {
                return `1/${exposureTime.denominator}s`;
            }
            return `${exposureTime.numerator}/${exposureTime.denominator}s`;
        }
        return String(exposureTime); // Fallback
    }

    // Helper function to format FNumber
    function formatFNumber(fNumber) {
        if (!fNumber) return "";
        if (fNumber.numerator && fNumber.denominator) {
            return `F${(fNumber.numerator / fNumber.denominator).toFixed(1)}`;
        }
        return `F${Number(fNumber).toFixed(1)}`; // Fallback
    }

    // Helper function to format FocalLength
    function formatFocalLength(focalLength) {
        if (!focalLength) return "";
        if (focalLength.numerator && focalLength.denominator) {
            return `${(focalLength.numerator / focalLength.denominator).toFixed(0)}mm`;
        }
        return `${Number(focalLength).toFixed(0)}mm`; // Fallback
    }
    
    // Helper function to format Flash (simple version)
    function formatFlash(flashValue) {
        if (flashValue === undefined || flashValue === null) return "";
        // EXIF spec for Flash tag is complex. This is a very simplified interpretation.
        // See https://www.exiftool.org/TagNames/EXIF.html#Flash for details
        if (flashValue === 0) return "No Flash";
        if (flashValue & 1) return "Flash Fired"; // Bit 0: flash fired
        return "Flash Did Not Fire"; // Or other states
    }


    // ファイルが選択されたときの処理
    imageUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                originalImage = new Image();
                originalImage.onload = function() {
                    // Canvasのサイズを画像に合わせる
                    imageCanvas.width = originalImage.width;
                    imageCanvas.height = originalImage.height;
                    // Canvasに画像を描画
                    ctx.drawImage(originalImage, 0, 0);

                    // Exif情報を取得して表示
                    EXIF.getData(originalImage, function() {
                        const allExif = EXIF.getAllTags(this);
                        console.log("全てのExif情報:", allExif); // デバッグ用に最初にコンソールに出力

                        // 主要な情報を取得
                        const make = EXIF.getTag(this, "Make");
                        const model = EXIF.getTag(this, "Model");
                        const dateTimeOriginal = EXIF.getTag(this, "DateTimeOriginal");
                        const exposureTime = EXIF.getTag(this, "ExposureTime");
                        const fNumber = EXIF.getTag(this, "FNumber");
                        const iso = EXIF.getTag(this, "ISOSpeedRatings");
                        const focalLength = EXIF.getTag(this, "FocalLength");
                        const lensModel = EXIF.getTag(this, "LensModel");
                        const software = EXIF.getTag(this, "Software");
                        const flash = EXIF.getTag(this, "Flash");
                        const whiteBalance = EXIF.getTag(this, "WhiteBalance"); // 0: Auto, 1: Manual
                        const meteringMode = EXIF.getTag(this, "MeteringMode");
                        const exposureProgram = EXIF.getTag(this, "ExposureProgram");
                        const exposureBias = EXIF.getTag(this, "ExposureBiasValue");
                        const colorSpace = EXIF.getTag(this, "ColorSpace"); // 1: sRGB


                        let exifTextForOutput = ""; // 詳細表示用テキスト
                        let watermarkLines = []; // 透かしの各行を格納する配列

                        // --- 詳細表示エリア用のテキスト生成 ---
                        if (make) exifTextForOutput += `メーカー: ${make}\n`;
                        if (model) exifTextForOutput += `機種: ${model}\n`;
                        if (lensModel) exifTextForOutput += `レンズ: ${lensModel}\n`;
                        if (dateTimeOriginal) exifTextForOutput += `撮影日時: ${dateTimeOriginal}\n`;
                        if (exposureTime) exifTextForOutput += `露出時間: ${formatExposureTime(exposureTime)}\n`;
                        if (fNumber) exifTextForOutput += `F値: ${formatFNumber(fNumber)}\n`;
                        if (iso) exifTextForOutput += `ISO感度: ISO${iso}\n`;
                        if (focalLength) exifTextForOutput += `焦点距離: ${formatFocalLength(focalLength)}\n`;
                        if (software) exifTextForOutput += `ソフトウェア: ${software}\n`;
                        if (flash !== undefined) exifTextForOutput += `フラッシュ: ${formatFlash(flash)}\n`;
                        if (whiteBalance !== undefined) exifTextForOutput += `ホワイトバランス: ${whiteBalance === 0 ? "自動" : (whiteBalance === 1 ? "手動" : whiteBalance)}\n`;
                        if (meteringMode !== undefined) exifTextForOutput += `測光モード: ${meteringMode}\n`; // (数値のまま、詳細はExif仕様参照)
                        if (exposureProgram !== undefined) exifTextForOutput += `露出プログラム: ${exposureProgram}\n`; // (数値のまま)
                        if (exposureBias && exposureBias.numerator !== undefined) {
                            exifTextForOutput += `露出補正: ${exposureBias.numerator / exposureBias.denominator} EV\n`;
                        } else if (exposureBias !== undefined) {
                            exifTextForOutput += `露出補正: ${exposureBias} EV\n`;
                        }
                        if (colorSpace !== undefined) exifTextForOutput += `色空間: ${colorSpace === 1 ? "sRGB" : colorSpace}\n`;
                        
                        exifInfoOutput.textContent = exifTextForOutput || "Exif情報が見つかりませんでした。";

                        // --- 透かし用テキスト生成 (主要情報を選んで数行にまとめる) ---
                        // 1行目: メーカー モデル
                        let line1 = "";
                        if (make) line1 += `${make} `;
                        if (model) line1 += `${model}`;
                        if (line1) watermarkLines.push(line1.trim());

                        // 2行目: レンズモデル (あれば)
                        if (lensModel) watermarkLines.push(`${lensModel}`);
                        
                        // 3行目: 撮影日時 (あれば)
                        if (dateTimeOriginal) watermarkLines.push(`${dateTimeOriginal}`);

                        // 4行目: 露出時間, F値, ISO, 焦点距離
                        let line4 = "";
                        if (exposureTime) line4 += `${formatExposureTime(exposureTime)} `;
                        if (fNumber) line4 += `${formatFNumber(fNumber)} `;
                        if (iso) line4 += `ISO${iso} `;
                        if (focalLength) line4 += `${formatFocalLength(focalLength)}`;
                        if (line4) watermarkLines.push(line4.trim());
                        
                        // 5行目: フラッシュ (あれば)
                        // const flashFormatted = formatFlash(flash);
                        // if (flashFormatted && flashFormatted !== "No Flash") watermarkLines.push(`Flash: ${flashFormatted}`);


                        // --- テキスト描画処理 ---
                        if (watermarkLines.length > 0) {
                            // 画像の短辺を基準にフォントサイズを決定 (より汎用的に)
                            const shortSide = Math.min(imageCanvas.width, imageCanvas.height);
                            const fontSize = Math.max(50, Math.min(shortSide / 5, 100)); // 例: 短辺の1/25、最小10px、最大30px

                            ctx.font = `bold ${fontSize}px Arial, sans-serif`; // 太字、フォールバックフォント指定
                            ctx.fillStyle = "rgba(255, 255, 255, 0.75)"; // 少し透明度を上げた
                            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // 文字に細い黒枠を追加して視認性向上
                            ctx.lineWidth = fontSize / 15; // 枠線の太さもフォントサイズに連動
                            ctx.textAlign = "right";
                            ctx.textBaseline = "bottom";
                            const padding = fontSize * 0.8; // パディングも調整

                            // 複数行のテキストを描画 (下から上に)
                            for (let i = 0; i < watermarkLines.length; i++) {
                                const textToDraw = watermarkLines[watermarkLines.length - 1 - i];
                                const yPosition = imageCanvas.height - padding - (i * (fontSize * 1.3)); // 行間調整 (1.3倍)
                                
                                // まず枠線を描画
                                ctx.strokeText(textToDraw, imageCanvas.width - padding, yPosition);
                                // 次に文字本体を描画
                                ctx.fillText(textToDraw, imageCanvas.width - padding, yPosition);
                            }
                        }
                    });
                }
                originalImage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // やり直しボタンの処理
    resetButton.addEventListener('click', function() {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        exifInfoOutput.textContent = "(ここにExif情報が表示されます)";
        imageUpload.value = null;
        originalImage = null;
        // Canvasサイズを初期化 (必要であれば)
        // imageCanvas.width = 0; 
        // imageCanvas.height = 0;
    });

    // 保存ボタンの処理
    saveButton.addEventListener('click', function() {
        if (!originalImage) {
            alert("まず画像を選択してください。");
            return;
        }
        
        // Canvasの内容を画像データURLとして取得 (PNG形式)
        const dataURL = imageCanvas.toDataURL("image/png"); 
        // またはJPEG形式: const dataURL = imageCanvas.toDataURL("image/jpeg", 0.9); // 0.9は品質

        // ダウンロード用のリンクを作成
        const link = document.createElement('a');
        link.href = dataURL;
        
        // ファイル名の生成 (例: originalname_watermarked.png)
        const originalFileName = imageUpload.files[0] ? imageUpload.files[0].name.split('.').slice(0, -1).join('.') : "image";
        link.download = `${originalFileName}_watermarked.png`; // PNGで保存する場合
        // link.download = `${originalFileName}_watermarked.jpg`; // JPEGで保存する場合

        // リンクをクリックさせてダウンロードを実行
        document.body.appendChild(link); // Firefoxで必要
        link.click();
        document.body.removeChild(link); // 後処理

        alert("画像を保存しました！ (PNG形式)");
    });

});