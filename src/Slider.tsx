import React, { Component, Children, ReactNode } from 'react';

import './assets/styles/slider.scss';
import { NavButton } from './components/nav-button';

type RenderProps = {
    content: ReactNode;
    prevButton: (arrow?: ReactNode) => ReactNode;
    nextButton: (arrow?: ReactNode) => ReactNode;
};

export type SliderProps = {
    children: ReactNode;
    duration: number;
    render?: (components: RenderProps) => ReactNode;
};

type State = {
    prevButtonVisible: boolean;
    nextButtonVisible: boolean;
    prevButtonDisabled: boolean;
    nextButtonDisabled: boolean;
    scrollWidth?: number;
};

export class Slider extends Component<SliderProps, State> {
    static defaultProps = {
        duration: 300
    };

    state = {
        prevButtonVisible: true,
        nextButtonVisible: true,
        prevButtonDisabled: false,
        nextButtonDisabled: false
    };

    private _mounted = false;

    componentDidMount() {
        this._mounted = true;
        window.addEventListener('resize', this.checkShowButtons);
        this.checkShowButtons();
    }

    componentDidUpdate(prevProps: SliderProps, prevState: State) {
        /**
         * Есть проблема, когда обновляются children, то нам нужно проверить, что они обновились.
         * Решили, что проверка длины скроллера будет лучшим решением
         *  */

        if (this.scroller && this.scroller.scrollWidth !== prevState.scrollWidth) {
            this.checkShowButtons();
        }
        if (Children.toArray(prevProps.children).length !== Children.toArray(this.props.children).length) {
            this.items = [];
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        window.removeEventListener('resize', this.checkShowButtons);
    }

    scroller: HTMLDivElement | null = null;
    slider: HTMLDivElement | null = null;
    items: (HTMLDivElement | null)[] = [];

    renderContent = () => (
        <div className="slider__scroller" onScroll={this.checkShowButtons} ref={scroller => (this.scroller = scroller)}>
            <div className="slider__body">
                {Children.map(this.props.children, (child, i) =>
                    child ? (
                        <div ref={el => (this.items[i] = el)} className="slider__item">
                            {child}
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );

    render() {
        return (
            <div className="slider" ref={slider => (this.slider = slider)}>
                {typeof this.props.render == 'function' ? (
                    this.props.render({
                        content: this.renderContent(),
                        prevButton: (arrow?: ReactNode) => (
                            <NavButton
                                onClick={this.checkScrollPrevious}
                                disabled={this.state.prevButtonDisabled}
                                visible={this.state.prevButtonVisible}
                                arrow={arrow}
                                className="slider__btn--left"
                            />
                        ),
                        nextButton: (arrow?: ReactNode) => (
                            <NavButton
                                onClick={this.checkScrollNext}
                                disabled={this.state.nextButtonDisabled}
                                visible={this.state.nextButtonVisible}
                                arrow={arrow}
                                className="slider__btn--right"
                            />
                        )
                    })
                ) : (
                    <>
                        <NavButton
                            onClick={this.checkScrollPrevious}
                            disabled={this.state.prevButtonDisabled}
                            visible={this.state.prevButtonVisible}
                            className="slider__btn--left"
                        />
                        {this.renderContent()}
                        <NavButton
                            onClick={this.checkScrollNext}
                            disabled={this.state.nextButtonDisabled}
                            visible={this.state.nextButtonVisible}
                            className="slider__btn--right"
                        />
                    </>
                )}
            </div>
        );
    }

    checkShowButtons = () => {
        if (!this.scroller) {
            return;
        }
        const { offsetWidth, scrollLeft, scrollWidth } = this.scroller;
        this.setState({
            nextButtonVisible: scrollWidth - offsetWidth > 0 && scrollLeft + offsetWidth < scrollWidth,
            prevButtonVisible: scrollWidth - offsetWidth > 0 && scrollLeft > 0,
            scrollWidth
        });
    };

    checkScrollNext = () => {
        if (!this.scroller || !this.items || !this.items.length) {
            return;
        }
        const scrollerVisibleWidth = this.scroller.offsetWidth;
        const scrollerScrollLeft = this.scroller.scrollLeft;
        const scrollerScrollRight = scrollerScrollLeft + scrollerVisibleWidth;
        const itemsWidths = Object.values(this.items).map(item => (item ? item.offsetWidth : 0));
        const itemsOffsetLeft = Object.values(this.items).map(item => (item ? item.offsetLeft : 0));
        const nextItemIndex = getNextItem(scrollerScrollLeft, scrollerScrollRight, itemsWidths);
        const scrollerWidth = this.scroller.scrollWidth;
        const possibleScroll = scrollerWidth - scrollerVisibleWidth + 1;
        const nextItem = nextItemIndex !== this.items.length ? itemsOffsetLeft[nextItemIndex] : null;

        function getNextItem(left: number, right: number, widths: number[]) {
            let availableWidth = 0,
                visibleWidth = 0,
                i = 0;

            do {
                availableWidth += widths[i];
                i++;
            } while (right >= availableWidth && i < widths.length);

            i = i - 1;

            for (let j = 0; j < i; j++) {
                visibleWidth += widths[j];
            }

            return visibleWidth <= left ? i + 1 : i; // Возникают проблемы вычислений для элементов, размеры которых
            // зависят от шрифтов. Все элементы имеют дробные значения и округляются до целого. В результате
            // 79.68 + 81.73 округляется как 80 + 82 = 162. В то время как scrollLeft получает значение 161.41 и
            // округляет до 161. Результатом является
            // зацикливание на одном элементе, отказ прокрутки вправо.
            // 1. Подобные ошибки возникают меньше при использовании универсальных шрифтов для разных ОС. Например Arial
            // не воспринимается OSX правильно.
            // 2. Установить диапазон погрешности, изменить условие на (visibleWidth - n <= left), где n - кол-во
            // пикселей погрешности. Чем дальше влево прокрутка, тем больше погрешность.
        }

        if (!nextItem || possibleScroll < nextItem || nextItemIndex === this.items.length) {
            this.prepareScrolling(possibleScroll);
        } else {
            this.prepareScrolling(nextItem);
        }
    };

    getFirstVisible = function(scrollLeft: number, widths: number[]) {
        let first = 0,
            i = 0;

        while (first < scrollLeft) {
            first += widths[i];
            i++;
        }

        return i;
    };

    getPrevItem = function(visibleScroll: number, firstVisible: number, widths: number[]) {
        let i = firstVisible,
            possible = 0;

        if (widths[i - 1] >= visibleScroll) {
            return i - 1;
        } else {
            do {
                i--;
                possible += widths[i];
            } while (possible < visibleScroll && i > -1);
            return i + 1;
        }
    };

    checkScrollPrevious = () => {
        if (!this.scroller) {
            return;
        }
        const scrollerVisibleWidth = this.scroller.offsetWidth;
        const scrollerScrollLeft = this.scroller.scrollLeft;
        const itemsWidths = Object.values(this.items).map((item: any) => item.offsetWidth);
        const firstVisible = this.getFirstVisible(scrollerScrollLeft, itemsWidths);
        const prevItemIndex = this.getPrevItem(scrollerVisibleWidth, firstVisible, itemsWidths);
        const itemsOffsetLeft = Object.values(this.items).map(item => (item ? item.offsetLeft : 0));
        const nextItem = itemsOffsetLeft[prevItemIndex];
        this.prepareScrolling(nextItem);
    };

    prepareScrolling(offsetLeft: number) {
        if (!this.scroller) {
            return;
        }
        const start = this.scroller.scrollLeft;
        const distance = offsetLeft - start;
        this.animateScrolling(start, distance);

        this.setState({
            nextButtonDisabled: true,
            prevButtonDisabled: true
        });

        setTimeout(
            () =>
                this._mounted &&
                this.setState({
                    nextButtonDisabled: false,
                    prevButtonDisabled: false
                }),
            this.props.duration + 50
        );
    }

    // Плавная прокрутка
    easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    animateScrolling(start: number, distance: number) {
        let currentTime = 0;
        const increment = 20;

        const doScroll = () => {
            currentTime += increment;
            if (this.scroller) {
                this.scroller.scrollLeft = this.easeInOutQuad(currentTime, start, distance, this.props.duration);
            }
            if (currentTime < this.props.duration) {
                setTimeout(doScroll, increment);
            }
        };

        doScroll();
    }
}

export default Slider;
