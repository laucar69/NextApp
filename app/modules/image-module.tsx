import type {HTMLAttributes, MouseEventHandler, ReactNode} from 'react';

type ImageModuleProps = {
    children?: ReactNode;
    className?: string;
    alt?: string;
    onDoubleClick?: MouseEventHandler<HTMLDivElement>;
    src?: string;
} & HTMLAttributes<HTMLDivElement>;

export function ImageModule({
    alt = 'Default',
    children,
    className = '',
    onDoubleClick,
    src = '/assets/admin/noimg.jpg',
    ...props
}: ImageModuleProps) {
    return (
        <div
            className={`col-12 module__card module__card--admin ${className}`.trim()}
            onDoubleClick={onDoubleClick}
            {...props}
        >
            <img src={src} alt={alt} />
            {children}
        </div>
    );
}
