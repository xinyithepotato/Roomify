import React, {useState} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS} from "../lib/constants";

interface UploadProps {
    onComplete: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setProgress(0);

        const reader = new FileReader();
        reader.onerror = () => {
            setFile(null);
            setProgress(0);
        };

        reader.onload = (e) => {
            const base64 = e.target?.result as string;

            const interval = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + PROGRESS_STEP;
                    if (next >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            onComplete(base64);
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(selectedFile);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const selected = e.target.files?.[0];
        if (selected) processFile(selected);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) processFile(dropped);
    };

    return (
        <div className={"upload"}>
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "dragging" : ""}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <input
                        type="file"
                        className={"drop-input"}
                        accept={".jpg,.jpeg,.png,.png"}
                        disabled={!isSignedIn}
                        onChange={onChange}
                    />
                    <div className={"drop-content"}>
                        <div className={"drop-icon"}>
                            <UploadIcon size={20}/>
                        </div>
                        <p>{isSignedIn ?(
                            "Click to upload or just drag and drop"
                        ) : ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className={"help"}>Maximum file size 10 MB.</p>
                    </div>
                </div>
            ) : (
                <div className={"upload-status"}>
                    <div className={"status-content"}>
                        <div className={"status-icon"}>
                            {progress === 100 ? (
                                <CheckCircle2 className={"check"}/>
                            ) : (
                                <ImageIcon className={"image"}/>
                            )}
                        </div>
                        <h3>{file.name}</h3>
                        <div className={'progress'}>
                            <div className="bar" style={{width: `${progress}%`}}/>
                            <p className={"status-text"}>
                                {progress <100? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Upload
