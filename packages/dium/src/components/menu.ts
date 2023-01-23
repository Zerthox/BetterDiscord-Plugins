export interface MenuProps extends Record<string, any> {
    navId: string;
    onClose: () => void;
    onSelect: () => void;
    "aria-label"?: string;
}

export interface MenuGroupProps {
    children: React.ReactNode;
}

interface BaseItemProps {
    id: string;
    label?: React.ReactNode;
    subtext?: React.ReactNode;
    isFocused?: boolean;
    action?: () => void;
    onClose?: () => void;
}

export interface MenuItemProps extends BaseItemProps {
    color?: string;
    hint?: any;
    children?: React.ReactNode;
    icon?: React.ComponentType<any>;
    iconProps?: any;
    showIconFirst?: boolean;
    imageUrl?: any;
    render?: () => JSX.Element;
}

export interface MenuCheckboxItemProps extends BaseItemProps {
    checked?: boolean;
    disabled?: boolean;
}

export interface MenuRadioItemProps extends BaseItemProps {
    checked?: boolean;
    group?: string;
}

export interface MenuControlItemProps extends BaseItemProps {
    control: (props: ControlProps, ref: React.MutableRefObject<any>) => JSX.Element;
}

interface ControlProps {
    disabled?: boolean;
    isFocused?: boolean;
    onClose: () => void;
}

interface MenuComponents {
    Menu: React.FunctionComponent<MenuProps>;
    Group: React.FunctionComponent<MenuGroupProps>;
    Item: React.FunctionComponent<MenuItemProps>;
    Separator: React.FunctionComponent<any>;
    CheckboxItem: React.FunctionComponent<MenuCheckboxItemProps>;
    RadioItem: React.FunctionComponent<MenuRadioItemProps>;
    ControlItem: React.FunctionComponent<MenuControlItemProps>;
}

export const {
    Menu: Menu,
    Group: MenuGroup,
    Item: MenuItem,
    Separator: MenuSeparator,
    CheckboxItem: MenuCheckboxItem,
    RadioItem: MenuRadioItem,
    ControlItem: MenuControlItem
}: MenuComponents = BdApi.ContextMenu as any;
