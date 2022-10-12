interface MenuProps {
    navId: string;
    onClose: () => void;
    onSelect: () => void;
    "aria-label"?: string;
}

interface MenuGroupProps {
    children: React.ReactChild;
}

interface BaseItemProps {
    id: string;
    label?: string;
    isFocused?: boolean;
    action?: () => void;
    onClose?: () => void;
}

interface MenuItemProps extends BaseItemProps {
    color?: string;
    subtext?: React.ReactChild;
    children?: React.ReactChild;
    icon?: () => JSX.Element;
    render?: () => JSX.Element;
}

interface MenuCheckboxItemProps extends BaseItemProps {
    checked?: boolean;
}

interface MenuRadioItemProps extends BaseItemProps {
    checked?: boolean;
    group?: string;
}

interface MenuControlItemProps extends BaseItemProps {
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
