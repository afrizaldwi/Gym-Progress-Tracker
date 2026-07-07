import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme';

type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';

type AppScreenProps = PropsWithChildren<{
    edges?: SafeAreaEdge[];
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
}>;

const defaultEdges: SafeAreaEdge[] = ['top', 'right', 'left'];

export function AppScreen({
    children,
    edges = defaultEdges,
    style,
    contentStyle,
}: AppScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.root,
                {
                    paddingTop: edges.includes('top') ? insets.top : 0,
                    paddingRight: edges.includes('right') ? insets.right : 0,
                    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
                    paddingLeft: edges.includes('left') ? insets.left : 0,
                },
                style,
            ]}
        >
            <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
    },
});