import { animate, group, query, style, transition, trigger } from "@angular/animations";

export const getState = (outlet) => {
    if (outlet.activatedRouteData.state) {
        return outlet.activatedRouteData.state;
    }
    return 'home';
}

export const routerTransition = trigger('routerTransition', [
    transition('* <=> *', [
        query(':enter, :leave', style({ opacity: 0, position: 'fixed', width: '100%' }), { optional: true }),
        group([
            query(':enter', [
                animate('0.2s ease-in', style({ opacity: 1 }))
            ], { optional: true }),
            query(':leave', [
                animate('0.2s ease-in', style({ opacity: 0 }))], { optional: true }),
        ])
    ])
]);

export const slideTransition = trigger('slideTransition', [
    transition('* <=> *', [
        query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))],
                { optional: true }),
        ])
    ])
])
