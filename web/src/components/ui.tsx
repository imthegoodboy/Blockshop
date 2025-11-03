import { twMerge } from "tailwind-merge";
import { InputHTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cn(...classes: (string | undefined | null | false)[]) {
        return twMerge(classes.filter(Boolean).join(" "));
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }) {
        const { className, variant = "primary", ...rest } = props;
        const variantClass = variant === "primary" ? "btn-primary" : "btn-outline";
        return <button className={cn(variantClass, className)} {...rest} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
        const { className, ...rest } = props;
        return <input className={cn("input-field", className)} {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
        const { className, ...rest } = props;
        return <textarea className={cn("input-field resize-none", className)} {...rest} />;
}

export function Card(props: { children: React.ReactNode; className?: string; onClick?: () => void }) {
        return <div className={cn("card", props.className)} onClick={props.onClick}>{props.children}</div>;
}

export function Badge(props: { children: React.ReactNode; className?: string }) {
        return <span className={cn("badge", props.className)}>{props.children}</span>;
}


